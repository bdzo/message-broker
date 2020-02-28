import { Message as Msg } from 'amqplib'
import { Message } from '../message'

export abstract class CommonChannel {
  abstract publish( m: Message ): Promise<void>

  abstract consume( cb: MessageCallback, options: any ): void
}

export type MessageCallback = ( m: Message ) => void

export const consumeMsg = ( cb: MessageCallback ) =>
                          ( m: Msg ) => cb( ( Message.fromMsg( m ) ) )
