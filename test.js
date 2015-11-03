var test = require("nrtv-test")(require)
var library = test.library


test.using(
  "server-side get",
  ["./", "nrtv-server"],
  function(expect, done, proxy, Server) {
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

    proxyToHome.get("/",
      function(response) {
        expect(response.body).to.match(
          /you are home/
        )
        home.stop()
        trulincs.stop()
        done()
      }
    )

  }
)




test.using(
  "get from browser",
  ["./", "nrtv-server",  library.reset("nrtv-browser-bridge"), "nrtv-browse"],
  function(expect, done, proxy, Server, bridge, browse) {

    var home = new Server()
    home.start(5054)

    var trulincs = new Server()
    var proxyToHome = proxy(trulincs, "http://localhost:5054")
    trulincs.start(6064)

    var getFromHome = proxyToHome.defineGetInBrowser()

    var phoneHome = bridge
    .defineFunction(
      [getFromHome],
      function write(get) {
        get("/email", function(text) {
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