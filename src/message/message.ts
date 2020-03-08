import { Message as Msg
       , MessageProperties } from 'amqplib'

export class Message<T> {

  constructor( readonly content: Buffer
             , readonly properties?: MessageProperties ) {
    this.properties = { ...properties, contentType: 'application/json' }
  }

  parse(): T {
    return JSON.parse( this.content.toString() )
  }

  static from<T>( content: T, properties?: MessageProperties ): Message<T> {
    // TODO: validate
    return new Message( Buffer.from( JSON.stringify( content ) ), properties )
  }

  static fromMsg<T>( m: Msg ): Message<T> {
    // TODO: validate
    return new Message( m.content, m.properties )
  }
}
