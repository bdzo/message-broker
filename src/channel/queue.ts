import { Connection
       , Replies
       , Channel
       , Options as AmqpOptions } from 'amqplib'
import { CommonChannel
       , consumeMsg
       , MessageCallback } from './channel'
import { Message } from '../message'

export type QueueOptions = { exclusive?: boolean
                           , durable?: boolean
                           , autoDelete?: boolean
                           , arguments?: object
                           , messageTtl?: number
                           , expires?: number
                           , deadLetterExchange?: string
                           , maxLength?: number
                           , prefetch?: number
                           , noCreate?: boolean }

export class Queue extends CommonChannel {

  constructor( readonly ch: Channel
             , readonly q: Replies.AssertQueue
             , readonly name: string
             , readonly options: QueueOptions ) { super() }

  static async assert( conn: Connection
                     , name: string
                     , options: QueueOptions ): Promise<Queue> {

    const ch = await conn.createChannel()
    const q = await ch.assertQueue( name, options )

    return new Queue( ch, q, name, options )
  }

  async consume( cb: MessageCallback
               , options: AmqpOptions.Consume ): Promise<Replies.Consume> {
    return this.ch.consume( this.name, consumeMsg( cb ), options )
  }

  async publish( m: Message ): Promise<void> {
    await this.ch.sendToQueue( this.name, m.content, m.properties )
  }

}
