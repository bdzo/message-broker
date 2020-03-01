const tap = require( 'tap' )

import { Connection } from '../../src/connection'
import { Message } from '../../src/message'

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

  await ch2.publish(exchange, queue, Buffer.from(msg))
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
  // const ch1 = await conn1.conn.createChannel()
  t.pass( 'channel 1 created' )
  // await ch1.assertExchange( exchange, 'topic', { durable: false } )
  t.pass( 'exchange 1 asserted' )

  const q1 = await conn1.declareQueue( '', { exclusive: true } )
  // const q = await e.ch.assertQueue( '', { exclusive: true } )
  t.pass( 'queue 1 asserted' )

  e1.bindQueue( q1, queue )
  // await e.ch.bindQueue( q.q.queue, exchange, queue )
  t.pass( 'queue 1 binded' )

  t.test( 'consumer test', ( t: any ) => {
    t.plan( 1 )
    e1.consume( ( m: Message ) => t.pass( 'message received' ), { noAck: true } )
  } )

  // PUBLISH
  const conn2 = await Connection.connect( process.env.QUEUE_URL )
  t.pass( 'connection 2 established' )
  // const ch2 = await conn2.createChannel()
  t.pass( 'channel 2 created' )

  const e2 = await conn2.declareExchange( exchange, 'topic', { durable: false } )  
  // await ch2.assertExchange(exchange, 'topic', { durable: false } )
  t.pass( 'exchange 2 asserted' )

  await e2.publish( Message.from( msg ), queue )
  // await ch2.publish(exchange, queue, Buffer.from(msg))
  t.pass( `[x] Sent ${queue}:'${msg}'` )


  t.tearDown( async () => { await conn1.disconnect(); await conn2.disconnect() } )  
} )