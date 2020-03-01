import { connect
       , Connection as Conn } from 'amqplib'
import { Queue
       , QueueOptions
       , Exchange
       , ExchangeOptions } from '../channel'

export class Connection {

  constructor( readonly conn: Conn ) { }

  static async connect( url: string, socketOptions?: any ): Promise<Connection> {
    const conn = await connect( url, socketOptions )
    return new Connection( conn )
  }

  async disconnect(): Promise<void> {
    return this.conn.close()
  }

  async declareQueue( name: string, options?: QueueOptions ): Promise<Queue> {
    return Queue.assert( this.conn, name, options )
  }

  async declareExchange( name: string, type: string, options?: ExchangeOptions ): Promise<Exchange> {
    return Exchange.assert( this.conn, name, type, options )
  }
}
