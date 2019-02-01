
console.log("Phantombuster Extension Loaded")
const _browser = chrome || browser
let website
let websiteName
let websiteUrl

// create the Get Cookies button
const createPbButton = () => {
	const checkExist = setInterval(() => {
		if (document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a")) {
			const apiLink = document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label a").getAttribute("href")
			for (const property in WEBSITEENUM) {
				if (apiLink.indexOf(WEBSITEENUM[property].match) > -1) {
					website = property
					break
				}
			}
			websiteName = WEBSITEENUM[website].name
			websiteUrl = WEBSITEENUM[website].websiteUrl
			const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input").length
			const btn = document.createElement("BUTTON")
			// btn.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`
			btn.id = "pbExtensionButton"
			btn.classList.add("btn", "btn-xs", "pull-right")
			btn.onclick = openConnection
			if (!document.querySelector("#pbExtensionButton")) {
				document.querySelector("div[data-alpaca-field-path*=\"/sessionCookie\"] label").appendChild(btn)
				document.querySelector("#pbExtensionButton").parentElement.style.display = "block"
			}
			enableButton()
		   clearInterval(checkExist)
		}
	}, 100)
}

// send a message to background script
const sendMessageToBackground = (message) => {
	_browser.runtime.sendMessage(message)
}

const disableButton = (cookiesLength) => {
	document.querySelectorAll("#pbExtensionButton").forEach(el => {
		el.classList.add("btn-success")
		el.classList.remove("btn-warning")
		el.setAttribute("disabled", true)
		el.textContent = `${websiteName} Cookie${cookiesLength > 1 ? "s" : ""} successfully pasted!`
	})
	listenInputChange()
}

const enableButton = () => {
	document.querySelectorAll("#pbExtensionButton").forEach(el => {
		el.classList.add("btn-primary")
		el.classList.remove("btn-success")
		el.classList.remove("btn-warning")
		const cookieCount = document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input").length
		el.textContent = `Get Cookie${cookieCount > 1 ? "s" : ""} from ${websiteName}`
		el.removeAttribute("disabled")
	})
}

// send the website to background to query its cookies
const openConnection = () => {
	console.log("opening Connection")
	console.log("website:", website)
	sendMessageToBackground({website})
}

const listenInputChange = () => {
	document.querySelector("#pbExtensionButton").parentElement.parentElement.querySelector("input").addEventListener("input", inputChange)
}

const inputChange = (event) => {
	console.log("input change", event)
	enableButton()
	event.target.removeEventListener("type", inputChange, true)
}

// fill the form with the correct cookie(s)
const setCookies = (cookies) => {
	for (let i = 0; i < cookies.length; i++) {
		document.querySelectorAll("div[data-alpaca-field-path*=\"/sessionCookie\"] input")[i].value = cookies[i].value
	}
	disableButton(cookies.length)
}

// listen to messages from background
_browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Message received:", message)
	if (message.opened) {
		console.log("We've opened the page.")
	}
	if (message.cookies) {
		const cookies = message.cookies
		if (cookies[0]) {
			console.log("Received cookies:", cookies[0])
			setCookies(cookies)
		} else {
			console.log("No cookies found!")
			document.querySelectorAll("#pbExtensionButton").forEach(el => {
				el.classList.replace("btn-primary", "btn-warning")
				el.textContent = `Please log in to ${websiteName} to get your cookie`
			})
			window.open(websiteUrl, "_blank")
			sendMessageToBackground({opening: websiteName})
		}
	}
})

// add an event listener next to all launch buttons
document.querySelectorAll(".launchButtonOptions, #launchButtonModalSwitchEditor").forEach(el => el.addEventListener("click", createPbButton))