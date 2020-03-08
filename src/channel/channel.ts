import { Message as Msg } from 'amqplib'
import { Message } from '../message'

export abstract class CommonChannel {
  abstract publish<T>( m: Message<T>, routingKey?: string ): Promise<void>

  abstract consume( cb: MessageCallback, options: any ): void
}

export type MessageCallback = <T>( m: Message<T> ) => void

export const consumeMsg = ( cb: MessageCallback ) =>
                          ( m: Msg ) => cb( ( Message.fromMsg( m ) ) )
