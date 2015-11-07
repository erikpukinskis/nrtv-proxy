var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-proxy",
  [
    library.collective({
      urls: {}
    }),
    "nrtv-make-request"
  ],
  function(collective, makeRequest) {

    function proxy(server, url) {

      do {
        var id = Math.random().toString(36).split(".")[1].substr(0,5)
      } while (collective.urls[id])

      collective.urls[id] = url

      var prefix = "/_nrtv-proxy/"+id

      server.use(
        function(request, response, next) {

          var match = request.path.match(/\/_nrtv-proxy\/([^/]+)[/$]/)

          if (!match) { return next() }

          var id = match[1]

          var path = request.url.replace("/_nrtv-proxy/"+id, "")
          var url = collective.urls[id]+path

          if (request.method == "POST") {
            var data = request.body
          }

          makeRequest({
            url: url,
            method: request.method,
            data: data
          }, function(body) {
            response.send(body)
          })
          console.log("should be hitting other server now:", request.method, collective.urls[id])
        }
      )

      return makeRequest.with({
        prefix: prefix,
        port: function() {
          return server.port
        }
      })
    }

    return proxy
  }
)