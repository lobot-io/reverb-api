var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  oboe = require('oboe'),
  ReverbListing = require('./listing.js'),
  request = require('request')


var reverbRequest = request.defaults({
  headers: {
    'X-Auth-Token': 'your-api-token',
    'Content-Type': 'application/hal+json',
    'Accept': 'application/hal+json'
  }
})

function Client() {
  EventEmitter.call(this)
}

util.inherits(Client, EventEmitter)

Client.prototype.getMyListings = function(href, callback) {
  href = href || '/api/my/listings.json'
  var stream = reverbRequest({
    uri: 'https://reverb.com' + href,
    headers: {
      'X-Auth-Token': 'your-api-token',
      'Content-Type': 'application/hal+json',
      'Accept': 'application/hal+json'
    },
    json: true
  })
  oboe(stream)
    .node('state', (node) => {
      // flatten out the state node
      return node.slug
    })
    .node('listings[*]', (node) => {
      var listing = ReverbListing.parse(node)
      this.emit('listing', listing)
      return listing
    })
    .done((result) => {
      // TODO: try to get this event to fire earlier
      this.emit('listings', result)
      return callback(null, result)
    })
}


module.exports = Client
