var _ = require('lodash'),
  request = require('request')

var reverbRequest = request.defaults({
  headers: {
    'X-Auth-Token': 'your-api-token',
    'Content-Type': 'application/hal+json',
    'Accept': 'application/hal+json'
  }
})

function Listing(data) {
  _.forIn(data, (value, field) => {
    this[field] = value
  })
}

Listing.prototype.getLink = function(key) {
  if (!this._links[key]) return null
  return this._links[key]
}

Listing.prototype.end = function(callback) {

  var uri = this.getLink('end')
  var options = {
    uri: 'https://reverb.com' + uri.href,
    method: uri.method,
    json: {
      reason: 'not_sold'
    }
  }

  reverbRequest(options, (err, response, body) => {
    if (!err && response.statusCode >= 400) err = new Error('Request generated a ' + response.statusCode + ' response.')
    if (body.errors) {
      console.log("NEED TO HANDLE REVERB ERRORS")
      console.error(body.errors)
      console.log("NEED TO HANDLE REVERB ERRORS")
    }
    return callback(err, body)
  })
}

Listing.prototype.update = function(updates, callback) {
  var uri = this.getLink('update')
  var options = {
    uri: 'https://reverb.com' + uri.href,
    method: uri.method,
    json: updates
  }

  reverbRequest(options, (err, response, body) => {
    if (!err && response.statusCode >= 400) err = new Error('Request generated a ' + response.statusCode + ' response.')
    return callback(err, body)
  })
}


Listing.parse = function(data) {

  listing = {

    sku: data.sku,
    inventory: data.inventory,
    state: data.state,
    uri: data._links['self'].href,
    _links: Object.assign({}, data._links)
  }

  return new Listing(listing)
}

module.exports = Listing
