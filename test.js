var test = require("nrtv-test")(require)
var library = test.library

test.using(
  "server-side post",
  ["./", "nrtv-server"],
  function(expect, done, proxy, Server) {
    var home = new Server()
    home.post("/",
      function(request, response) {
        expect(request.body.who).to.equal("me")
        done.ish("passed data")
        response.send("you are home")
      }
    )

    home.start(9944)

    var trulincs = new Server()
    var proxyToHome = proxy(trulincs, "http://localhost:9944")

    trulincs.start(7623)

    proxyToHome({
      method: "post",
      path: "/",
      data: {who: "me"}
    }, function(text) {
      expect(text).to.match(
        /you are home/
      )
      home.stop()
      trulincs.stop()
      done()
    })

  }
)


test.using(
  "server-side get",
  ["./", "nrtv-server"],
  function(expect, done, proxy, Server) {
    var home = new Server()
    home.get("/",
      function(request, response) {
        response.send("you are here")
      }
    )

    home.start(2222)

    var trulincs = new Server()
    var proxyToHome = proxy(trulincs, "http://localhost:2222")
    trulincs.start(8888)

    proxyToHome({
      method: "get",
      path: "/",
    }, function(text) {
      expect(text).to.match(
        /you are here/
      )
      home.stop()
      trulincs.stop()
      done()
    })

  }
)



test.using(
  "get from browser",
  ["./", "nrtv-server",  library.reset("browser-bridge"), "nrtv-browse"],
  function(expect, done, proxy, Server, bridge, browse) {

    var home = new Server()
    home.start(5054)

    var trulincs = new Server()
    var proxyToHome = proxy(trulincs, "http://localhost:5054")
    trulincs.start(6064)


    var phoneHome = bridge
    .defineFunction(
      [proxyToHome.defineOn(bridge)],
      function write(makeRequest) {
        makeRequest({
          method: "get",
          path: "/email"
        }, function(text) {
          document.write(text)
        })
      }
    )

    home.get("/email",
      function(request, response) {
        response.send("hi honey")
      }
    )

    bridge.asap(phoneHome)

    trulincs.get("/",
      bridge.sendPage()
    )

    browse("http://localhost:6064",
      function(browser) {
        browser.assert.text("body", "hi honey")
        home.stop()
        trulincs.stop()
        done()
      }
    )
  }
)