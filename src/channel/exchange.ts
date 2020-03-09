import { Connection
       , Replies
       , Channel
       , Message as AmqpMessage
       , Options as AmqpOptions } from 'amqplib'
import { CommonChannel
       , MessageCallback } from './channel'
import { Message } from '../message'

export type ExchangeOptions = { durable?: boolean
                              , internal?: boolean
                              , autoDelete?: boolean
                              , alternateExchange?: string
                              , arguments?: any
                              , noCreate?: boolean }

export type Consumer = { routingKey: string, cb: MessageCallback }

export class Exchange extends CommonChannel {

  constructor( readonly ch: Channel
             , readonly q: Replies.AssertQueue
             , readonly name: string
             , readonly type: string
             , readonly options: ExchangeOptions ) { super() }

  static async assert( conn: Connection
                     , name: string
                     , type: string
                     , options: ExchangeOptions ): Promise<Exchange> {

    const ch = await conn.createChannel()
    await ch.assertExchange( name, type, options )
    const q = await ch.assertQueue( '', { exclusive: true } )

    return new Exchange( ch, q, name,type, options )
  }

  async consume( cb: MessageCallback
               , options: AmqpOptions.Consume
               , routingKey?: string ): Promise<Replies.Consume> {

    await this.ch.bindQueue( this.q.queue, this.name, routingKey )

    return this.ch.consume( this.q.queue
                          , consumeWithAckCb( this.ch, { routingKey, cb } )
                          , options )
  }

  consumers( cs: Consumer[]
           , options: AmqpOptions.Consume ): void {
    cs.forEach( forConsumer( this.ch, this.q, options, this.name ) )
  }

  async publish<T>( m: Message<T>, routingKey: string ): Promise<void> {
    await this.ch.publish( this.name, routingKey, m.content, m.properties )
  }
}

const forConsumer = ( ch: Channel
                    , q: Replies.AssertQueue
                    , options: AmqpOptions.Consume
                    , exchange: string ) =>
                    ( c: Consumer ) =>
                     ch.bindQueue( q.queue, exchange, c.routingKey )
                       .then( initConsumer( ch, q, options, c ) )

const initConsumer = ( ch: Channel
                     , q: Replies.AssertQueue
                     , options: AmqpOptions.Consume
                     , c: Consumer ) =>
                     () =>
                      ch.consume( q.queue, consumeWithAckCb( ch, c ), options )

const consumeWithAckCb = ( ch: Channel, c: Consumer ) =>
                         ( m: AmqpMessage ) =>
                          c.cb( Message.fromMsg( m ) )
                           .then( () => ch.ack( m ) )
                           .catch( () => ch.nack( m ) )
