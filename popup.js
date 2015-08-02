var run = function(code, callback) {
	chrome.tabs.executeScript({ code: code }, function(results) {
		callback(results[0]);
	});
}

var message = function(string, target) {
	document.getElementById(target || "results").innerText = string;
}

var packageFromText = function(text) {
	// Some mappings for my packages
	if (/little/i.test(text)) {
		return "com.rpetrich.littlebrother";
	}
	if (/recorder/i.test(text)) {
		return "com.booleanmagic.displayrecorder";
	}
	if (/pane/i.test(text)) {
		return "com.rpetrich.videopane";
	}
	if (/auxo/i.test(text)) {
		return "com.a3tweaks.auxo-le";
	}
	if (/grabby/i.test(text)) {
		return "com.rpetrich.grabby";
	}
	if (/lockdown/i.test(text)) {
		return "com.rpetrich.biolockdown";
	}
	if (/fullforce/i.test(text)) {
		return "com.rpetrich.fullforce";
	}
	if (/haptic/i.test(text)) {
		return "hapticpro";
	}
	if (/wizard/i.test(text)) {
		return "org.thebigboss.onehandwizard";
	}
	// Generic matching, to see if something looks like a package identifier
	return /^[\w.-]+$/.test(text);
}

var giftPackage = function(packageText, identifier) {
	// Precheck
	document.getElementById("identifier").value = identifier;
	var package = packageFromText(packageText);
	if (!package) {
		document.getElementById("package").value = packageText;
		document.getElementById("submit").style.display = "block";
		message("Fill in package identifier above");
		return;
	}
	document.getElementById("package").value = package;
	document.getElementById("submit").style.display = "none";
	var url = "https://cydia.saurik.com/connect/products/" + package + "/complimentary";

	// Fill the form
	var finishedFirst;
	chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
		if (!finishedFirst) {
			finishedFirst = true;
			message("Filling form...");
			chrome.tabs.executeScript(details.tabId, { code: 
				"var f=document.createElement('form');f.method='POST';f.action='complimentary_';" +
				"var a=document.createElement('input');a.type='hidden';a.name='account';a.value=" + JSON.stringify([identifier]) + "[0];f.appendChild(a);" +
				"document.body.appendChild(f);f.submit();"
			}, function() {
			});
		}
	}, {
		url: [{
			urlEquals: url
		}]
	});

	// Handle form submitted callback
	var finishedSecond;
	chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
		if (!finishedSecond) {
			finishedSecond = true;
			message("Fetching results...");
			chrome.tabs.executeScript(details.tabId, { code: 
				"document.querySelector('block').innerText"
			}, function(results) {
				message(results[0]);
				document.getElementById("submit").style.display = "block";
				chrome.tabs.remove([details.tabId], function() {
					// Goodnight Moon
				});
			});
		}
	}, {
		url: [{
			urlEquals: url + "_"
		}]
	});

	// Create our worker tab
	message("Loading form...");
	chrome.tabs.create({
		url: url,
		active: false
	}, function(tab) {
	});
}

message("Getting data...");

run("document.getSelection().toString()", function(selection) {
	run("location.hostname+location.pathname", function(urldata) {
		if (urldata == "mail.google.com/mail/u/0/") {
			run("(function(e){return e[e.length-1].innerText})(document.querySelectorAll('h2'))", function(subject) {
				giftPackage(subject, selection);
			});
		} else {
			giftPackage("", selection);
		}
	});
});

document.getElementById("submit").addEventListener("click", function() {
	giftPackage(document.getElementById("package").value, document.getElementById("identifier").value);
}, false);
