import { Message as Msg
       , MessageProperties } from 'amqplib'

export class Message {

  constructor( readonly content: Buffer
             , readonly properties?: MessageProperties ) {
    this.properties = { ...properties, contentType: 'application/json' }
  }

  parse(): object {
    return JSON.parse( this.content.toString() )
  }

  static from( content: object, properties?: MessageProperties ): Message {
    // TODO: validate
    return new Message( Buffer.from( JSON.stringify( content ) ), properties )
  }

  static fromMsg( m: Msg ): Message {
    // TODO: validate
    return new Message( m.content, m.properties )
  }
}
