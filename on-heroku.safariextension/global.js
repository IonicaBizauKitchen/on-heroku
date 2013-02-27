const ON_HEROKU_WEB_ENDPOINT = "https://on-heroku.herokuapp.com/"

function domainFromURL(url) { return url ? url.replace(/^https?:\/\//, '').replace(/[:\/].*/, '') : null }
function domainFromTab(tab) { return domainFromURL(tab.url) }

function checkIsDomainOnHeroku(domain) {
  if (!domain) return false
  var req = new XMLHttpRequest()
  req.open("GET", ON_HEROKU_WEB_ENDPOINT + domain, false)
  req.send()
  if (req.status != 200) return false
  var response = JSON.parse(req.responseText)
  return response['on-heroku']
}

var isOnHerokuCache = {}
function storeIsDomainOnHeroku(domain) {
  if (!isOnHerokuCache.hasOwnProperty(domain)) isOnHerokuCache[domain] = checkIsDomainOnHeroku(domain)
}

function updateOnHerokuDisplayForWindow(browserWindow) {
  if (!browserWindow) return null
  var onHerokuToolbarButton = safari.extension.toolbarItems.filter(function(toolbarItem) {
    return toolbarItem.browserWindow == browserWindow && toolbarItem.identifier == 'on-heroku' })[0]

  var domain = domainFromTab(browserWindow.activeTab)
  onHerokuToolbarButton.image = onHerokuToolbarButton.image.replace(/-(yes|no)/, isOnHerokuCache[domain] ? '-yes' : '-no')
}

function updateOnHerokuDisplay(event) {
  var eventTab = event.target
  if (! eventTab instanceof SafariBrowserTab) return null
  storeIsDomainOnHeroku(domainFromTab(eventTab))
  updateOnHerokuDisplayForWindow(eventTab.browserWindow)
}

safari.application.addEventListener("navigate", updateOnHerokuDisplay, true)
safari.application.addEventListener("activate", updateOnHerokuDisplay, true)
safari.application.addEventListener("beforeNavigate", function(event) { storeIsDomainOnHeroku(domainFromURL(event.url)) }, true)
