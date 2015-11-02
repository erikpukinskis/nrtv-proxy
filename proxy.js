var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-proxy",
  [
    library.collective({
      identifiers: {}
    }),
    "request",
    "http",
    "http-proxy"
  ],
  function(collective, request, http, httpProxy) {

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

      return new Proxy(prefix)
    }


    function Proxy(prefix) {
      this.prefix = prefix
    }

    Proxy.prototype.get =
      function(path, callback) {

      path = path.replace(/^\/?/, "")

      var url = "http://localhost:7623"+this.prefix+"/"+path


      request(url,
        function(error, response) {
          if (error) {
            console.log(" ⚡ PROXY ERROR ⚡ Hitting "+url)
            throw error
          }
          callback(response)
        }
      )
    }

    return proxy
  }
)