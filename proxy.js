var library = require("nrtv-library")(require)

module.exports = library.export(
  "nrtv-proxy",
  [
    library.collective({
      identifiers: {}
    }),
    "request",
    "http",
    "http-proxy",
    "nrtv-browser-bridge",
    "nrtv-ajax"
  ],
  function(collective, request, http, httpProxy, bridge, ajax) {

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

      return new Proxy(prefix, server)
    }


    function Proxy(prefix, server) {
      this.prefix = prefix
      this.server = server
    }

    Proxy.prototype._getUrl =
      function(path) {
        path = path ? path.replace(/^\/?/, "") : ""

        return "http://localhost:"+this.server.port+this.prefix+"/"+path
      }

    Proxy.prototype.get =
      function(path, callback) {

      request(
        this._getUrl(path),
        function(error, response) {
          if (error) {
            console.log(" ⚡ PROXY ERROR ⚡ Hitting "+url)
            throw error
          }
          callback(response)
        }
      )
    }

    Proxy.prototype.defineGetInBrowser = function() {

      return bridge.defineFunction(
        [ajax.defineGetInBrowser()],
        function proxyGet(get, prefix, path, callback) {
          path = path ? path.replace(/^\/?/, "") : ""

          get(prefix+path, callback)
        }
      ).withArgs(this._getUrl())
    }

    return proxy
  }
)