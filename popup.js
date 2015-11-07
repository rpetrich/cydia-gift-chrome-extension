
var run = function(code, callback) {
	chrome.tabs.executeScript({ code: code }, function(results) {
		callback(results[0]);
	});
}

var message = function(string, target) {
	document.getElementById(target || "results").innerText = string;
}

function messageLog(string, resultNM, target) {
	document.getElementById(target || "results"+resultNM).innerText = string;
}
var packageFromText = function(text) {
	return "com.imokhles."+text;
}


function SplitTheString(CommaSepStr) {
    var ResultArray = null; 

    if (CommaSepStr!= null) {
    	var SplitChars = ',';
        if (CommaSepStr.indexOf(SplitChars) >= 0) {
            ResultArray = CommaSepStr.split(SplitChars);
        }
    }
    return ResultArray ;
}

function doGiftWithArray() {
	var packagePre = document.getElementById("package").value; 
	var identifierCydia = document.getElementById("identifier").value; //"633674,5602631,4497721,132261,5124413,467099846,2978087,2971462,466205281,5987906,465337509,467097230,441446,5573314,465939862";
	var tempArray = new Array();
	tempArray = SplitTheString(identifierCydia);

	// var count = 0;
	for (var i = 0; i < tempArray.length; i++) {
		var identifier = tempArray[i];
		// if (i != tempArray.length - 1) {
			
			var package = packageFromText(packagePre);
			messageLog(package+"", 0);
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
			// var finishedFirst;
			chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
				// if (!finishedFirst) {
					finishedFirst = true;
					message("Filling form...");
					chrome.tabs.executeScript(details.tabId, { code: 
						"var f=document.createElement('form');f.method='POST';f.action='complimentary_';" +
						"var a=document.createElement('input');a.type='hidden';a.name='account';a.value=" + JSON.stringify([identifier]) + "[0];f.appendChild(a);" +
						"document.body.appendChild(f);f.submit();"
					}, function() {
					});
				// }
			}, {
				url: [{
					urlEquals: url
				}]
			});

			// Handle form submitted callback
			// var finishedSecond;
			chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
				// if (!finishedSecond) {
					finishedSecond = true;
					message("Fetching results...");
					chrome.tabs.executeScript(details.tabId, { code: 
						"document.querySelector('block').innerText"
					}, function(results) {
						message(identifier+" "+results[0]);
						document.getElementById("submit").style.display = "block";
						chrome.tabs.remove([details.tabId], function() {
							// Goodnight Moon
						});
					});
				// }
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
			// count++;
			// message("ID: " + identifier);
		// } else {
		// 	message("ID: " + identifier);
		// }	 
		
	}
}
document.getElementById("submit").addEventListener("click", function() {
	doGiftWithArray();
}, false);
