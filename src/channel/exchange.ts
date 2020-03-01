import { Connection
       , Replies
       , Channel
       , Options as AmqpOptions } from 'amqplib'
import { CommonChannel
       , consumeMsg
       , MessageCallback } from './channel'
import { Queue } from './queue'
import { Message } from '../message'

export type ExchangeOptions = { durable?: boolean
                              , internal?: boolean
                              , autoDelete?: boolean
                              , alternateExchange?: string
                              , arguments?: any
                              , noCreate?: boolean }

export class Exchange extends CommonChannel {

  protected q: Queue

  constructor( readonly ch: Channel
             , readonly name: string
             , readonly type: string
             , readonly options: ExchangeOptions ) { super() }

  static async assert( conn: Connection
                     , name: string
                     , type: string
                     , options: ExchangeOptions ): Promise<Exchange> {

    const ch = await conn.createChannel()
    await ch.assertExchange( name, type, options )

    return new Exchange( ch, name,type, options )
  }

  async consume( cb: MessageCallback
               , options: AmqpOptions.Consume ): Promise<Replies.Consume> {
    return this.ch.consume( this.q.q.queue, consumeMsg( cb ), options )
  }

  async publish( m: Message, routingKey: string ): Promise<void> {
    await this.ch.publish( this.name, routingKey, m.content, m.properties )
  }

  async bindQueue( q: Queue, pattern: string ): Promise<Exchange> {
    // TODO: 
    this.q = q
    await this.ch.bindQueue( q.q.queue, this.name, pattern )

    return this
  }
}