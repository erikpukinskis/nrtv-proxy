var test = require("nrtv-test")(require)

test.using(
  "pass a request through one server to another",
  ["./", "nrtv-server", "http"],
  function(expect, done, proxy, Server, http) {
    var home = new Server()
    home.get("/",
      function(request, response) {
        response.send("you are home")
      }
    )

    home.start(9944)

    var trulincs = new Server()
    var proxyToHome = proxy(trulincs, "http://localhost:9944")
    trulincs.start(7623)

    var getHome = proxyToHome.get("/")

    getHome(function(response) {
      expect(response.body).to.match(
        /you are home/
      )
      home.stop()
      trulincs.stop()
      done()
    })

  }
)