const tap = require( 'tap' )

import { Connection } from '../../src/connection'
import { Message } from '../../src/message'
import { Consumer } from '../../src/channel/exchange'

import { connect } from 'amqplib'

tap.test( 'topic log', async ( t: any ) => {
  t.plan( 10 )

  const exchange = `topic_log_${Date.now()}`
  const queue = `topic.log.${Date.now()}`
  const msg = JSON.stringify( { hello: `world ${Date.now()}` } )

  // CONSUME
  const conn1 = await connect( process.env.QUEUE_URL )
  t.pass( 'connection 1 established' )

  const ch1 = await conn1.createChannel()
  t.pass( 'channel 1 created' )

  await ch1.assertExchange( exchange, 'topic', { durable: false } )
  t.pass( 'exchange 1 asserted' )

  const q = await ch1.assertQueue( '', { exclusive: true } )
  t.pass( 'queue 1 asserted' )

  await ch1.bindQueue( q.queue, exchange, queue )
  t.pass( 'queue 1 binded' )

  t.test( 'consumer test', ( t: any ) => {
    t.plan( 1 )
    ch1.consume( q.queue, ( _: any ) => t.pass( 'message received' ), { noAck: true } )
  })

  // PUBLISH
  const conn2 = await connect( process.env.QUEUE_URL )
  t.pass( 'connection 2 established' )

  const ch2 = await conn2.createChannel()
  t.pass( 'channel 2 created' )

  await ch2.assertExchange(exchange, 'topic', { durable: false } )
  t.pass( 'exchange 2 asserted' )

  ch2.publish(exchange, queue, Buffer.from(msg))
  t.pass( `[x] Sent ${queue}:'${msg}'` )


  t.tearDown( async () => { await conn1.close(); await conn2.close() } )  
} )

tap.test( 'topic log custom', async ( t: any ) => {
  t.plan( 10 )

  const exchange = `topic_log_custom_${Date.now()}`
  const queue = `topic.log.${Date.now()}`
  const msg = { hello: `world ${Date.now()}` }

  // CONSUME
  const conn1 = await Connection.connect( process.env.QUEUE_URL )
  t.pass( 'connection 1 established' )

  const e1 = await conn1.declareExchange( exchange, 'topic', { durable: false } )  
  t.pass( 'channel 1 created' )
  t.pass( 'exchange 1 asserted' )
  t.pass( 'queue 1 asserted' )
  t.pass( 'queue 1 binded' )

  /**
   * Plan to call consumer callback three times. First consumer is called just 
   * once, but second is called twice, since first time it throws and fails.
   * This way we test if failed messages are requeued. Thanks 
   * */
  t.test( 'consumer test', ( t: any ) => {
    t.plan( 4 )

    const consumer1 = async ( _: any ) => {
      t.pass( 'consumer 1 got message' )
    }

    let throwed = false

    const consumer2 = async ( _: any ) => {
      t.pass( 'consumer 2 got message' )

      if ( throwed == false ) {
        throwed = true
        throw 'nai'
      }
    }

    const consumers: Consumer[]
      = [ { routingKey: queue, cb: consumer1 }
        , { routingKey: `${queue}.failed`, cb: consumer2 } ]

    e1.consumers( consumers, { noAck: false } )
    e1.consume( consumer1, { noAck: false }, `${queue}.single` )
  } )

  // PUBLISH
  const conn2 = await Connection.connect( process.env.QUEUE_URL )
  t.pass( 'connection 2 established' )
  t.pass( 'channel 2 created' )

  const e2 = await conn2.declareExchange( exchange, 'topic', { durable: false } )  
  t.pass( 'exchange 2 asserted' )

  await e2.publish( Message.from( msg ), queue )
  await e2.publish( Message.from( msg ), `${queue}.failed` )
  await e2.publish( Message.from( msg ), `${queue}.single` )
  t.pass( 'messages sent' )

  t.tearDown( async () => { await conn2.disconnect(); await conn1.disconnect() } )
} )
