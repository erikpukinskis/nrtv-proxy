var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-proxy",
  [
    library.collective({
      identifiers: {}
    }),
    "http-proxy",
    "nrtv-make-request"
  ],
  function(collective, httpProxy, makeRequest) {

    function proxy(server, url) {

      do {
        var id = Math.random().toString(36).split(".")[1].substr(0,5)
      } while (collective.identifiers[id])

      collective.identifiers[id] = true

      var prefix = "/_nrtv-proxy/"+id

      var proxyServer = httpProxy.createProxyServer({})

      server.get("/_nrtv-proxy/:id/*",
        function(request, response) {
          var id = request.params.id

          request.url = request.url.replace(/^\/_nrtv-proxy\/[a-zA-Z0-9]+/, "")


          proxyServer.web(
            request,
            response,
            {target: url}
          )
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