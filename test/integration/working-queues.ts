const tap  = require( 'tap' )

import { connect } from 'amqplib'

import { Connection } from '../../src/connection'
import { Message } from '../../src/message'

tap.test( 'hello world', async ( t: any ) => {
  t.plan( 9 )

  const queue = 'simo.simic.quic'
  const msg = JSON.stringify( { hello: `world.${Date.now()}` } )

  // PUBLISH
  const conn1 = await connect( process.env.QUEUE_URL )
  t.pass( 'connection 1 established' )

  const ch1 = await conn1.createChannel()
  t.pass( 'channel 1 created' )

  await ch1.assertQueue( queue, { durable: false } )
  t.pass( 'queue asserted' )

  await ch1.consume( queue
                   , ( _: any ) => t.pass( 'message received' )
                   , { noAck: true } )
  t.pass( 'consumer setup' )

  // PUBLISH
  const conn2 = await connect( process.env.QUEUE_URL )
  t.pass( 'connection established' )

  const ch2 = await conn2.createChannel()
  t.pass( 'channel created' )

  await ch2.assertQueue( queue, { durable: false } )
  t.pass( 'queue asserted' )

  await ch2.sendToQueue( queue, Buffer.from( msg ) )
  t.pass( 'message sent')

  await conn1.close()
  await conn2.close()
} )


// tap.test( 'working queues', async ( t:any ) => {

// } )

tap.test( 'working queues', async ( t:any ) => {
  t.plan( 9 )

  const msg = { hello: `world.${Date.now()}` }
  const queue = 'simo.simic.qui2'

  // PUBLISH
  const conn1 = await Connection.connect( process.env.QUEUE_URL )
  t.pass( 'connection 1 established' )

  const q1 = await conn1.declareQueue( queue, { durable: false } )
  // const ch1 = await conn1.conn.createChannel()
  t.pass( 'channel 1 created' )
  // await ch1.assertQueue( queue, { durable: false } )
  t.pass( 'queue asserted' )
  // await q1.ch.consume( queue
  //                    ,  ( msg: any ) => { t.pass( 'message received' ); console.log( msg ) }
  //                     , { noAck: true } )
  await q1.consume( ( _: any ) => t.pass( 'message received' )
                  , { noAck: true } )
  t.pass( 'consumer setup' )

  // PUBLISH
  const conn2 = await Connection.connect( process.env.QUEUE_URL )
  t.pass( 'connection established' )

  const q2 = await conn2.declareQueue( queue, { durable: false } )
  // const ch2 = await conn2.conn.createChannel()
  t.pass( 'channel created' )
  // await ch2.assertQueue( queue, { durable: false } )
  t.pass( 'queue asserted' )
  // await ch2.sendToQueue( queue, Buffer.from( msg ) )
  await q2.publish( Message.from( msg ) )
  t.pass( 'message sent')

  await conn1.disconnect()
  await conn2.disconnect()
} )
