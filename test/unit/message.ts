const tap = require( 'tap' )

import { Message } from '../../src/message'

tap.test( 'test message', ( t: any ) => { 
  const data = { hello: 'world' }

  const m = Message.from( data )

  t.deepEqual( data, m.parse() )
  t.end()
} )
