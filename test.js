var test = require("nrtv-test")(require)
var library = test.library

test.using(
  "pass a request through one server to another",
  ["./", "nrtv-server", "http", library.reset("nrtv-browser-bridge"), "nrtv-browse"],
  function(expect, done, proxy, Server, http, bridge, browse) {
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

        done.ish("proxy works through server library")

        tryFromBrowser()
      }
    )


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

    function tryFromBrowser() {
      browse("http://localhost:7623",
        function(browser) {
          browser.assert.text("body", "hi honey")
          home.stop()
          trulincs.stop()
          done()
        }
      )
    }
  }
)