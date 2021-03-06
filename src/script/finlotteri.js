// Constants
const CONTESTANTS_URL = "data/contestants.csv";
const CONFIG_URL = "data/config.json";
const PARROT_PROVIDER_URL = "data/parrots.json";
const PARROTS_DIR = "images/parrots/";

// Global variables
var contestants=[];
var numContestants = 0;

var currentDrawnNameIdx = 0;
var shuffledContestantArray=[];

var intervalVar;
var progressBarVar;
var currentInterval = 50;
var currentGrowth = 15;

var spins = 20;
var count = 0;

var clickSound = new Audio("sounds/ch.mp3");

// On load
$(document).ready(function() {
	
	function playSound()
	{
		clickSound.currentTime = 0;
		clickSound.play();
	}
	
	function playWinnerSound()
	{
		document.getElementById('audiotag1').play();
	}
	
	/* Click events */
	
	function clickDrawWinner() {
		resetVariables();
		$("#drawButton").attr("disabled", true);
		$("#startSlowdownButton").attr("disabled", false);
		$("#startSlowdownButton").show();
		$("#startSlowdownButton").focus();
		intervalVar = setInterval(next, currentInterval);
		$("#deltagere").fadeOut();				
	}

	function clickAdd() {
		var tmp = $("#newName").val();
		addContestant(tmp);
	}			
	
	function clickName(obj) {
		var name = obj.text();

		var confirmed = confirm('Fjern ' + name + ' fra lista?');
		if (confirmed)
			removeContestant(name)
	}			
	
	/* Handle contestants */
	
	function addContestant(name) {
		var newName = name.charAt(0).toUpperCase() + name.slice(1);
		if (newName == '')
			return
			
		var idx = contestants.push(newName);
		
		var newElement = '<li class="ticket_' + newName + '" id="' + idx + '">'+newName+'</li>';
		$("#contestents ul").append(newElement);
		$("#newName").val("");

		var listElement = '#contestents ul li:last';
		
		$(listElement).click(function () {clickName($(this))});
		$("#drawButton").attr("disabled", false);	

	}
	
	function removeContestant(name) {
		var listElement = '#contestents ul li:contains("' + name + '")';
		$(listElement+":first").remove();
		
		var num = $.inArray(name, contestants);
		contestants.splice(num, 1);
		
		if (contestants.length < 1)
			$("#drawButton").attr("disabled", true);
		
	}
	
	function loadConfig() {
		$.getJSON(CONFIG_URL, function(data) {
			$("h1").text(data.LotteryTitle);
			$("#background").css("background-image", "url(../images/" + data.ThemeImageFile + ")");
		});
	}
	
	function getDefaultContestants() {
		$.ajax({
			type: "GET",
			url: CONTESTANTS_URL,
			dataType: "text",
			contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			success: function(data) {processDefaultContestants(data);}
		 });
	}
	
	function processDefaultContestants(allText) {
		var allTextLines = allText.split(/\r\n|\n/);

		for (var i=0; i<allTextLines.length; i++) {
			var data = allTextLines[i].split(';');
			var name = data[0];
			var num = data[1];
			
			for (var j=0;j<num;j++) {
				addContestant(name);
			}
		}
	}			

	function processParrots(parrotList) {
		var index = Math.floor(Math.random()*parrotList.length);
		var file = parrotList[index];
		$("#parrot").attr("src", PARROTS_DIR + file);
	}
	
	
	// Draw winner methods

	function resetVariables() {
	
		shuffledContestantArray = randomizeArray(contestants);
		
		numContestants = contestants.length;
		
		currentInterval = 50;
		currentGrowth = 15;

		var randomNumber = Math.floor(Math.random()*10)
		spins = 5 + randomNumber;
		count = 0;
		
		$("#name").css("color", "black");
		$("#name").css("text-style:", "none");	
		$("#parrot").removeAttr("src");
	}
	
	function next() {	
		setNextName();
		
		if (count < spins) 
			 count++;
		else 
			currentInterval = currentInterval+currentGrowth;
		
		if (currentInterval < 600) {
			if (currentInterval > 500) {
				currentGrowth+=20;
			}
			clearInterval(intervalVar);
			intervalVar = setInterval(next, currentInterval);
		} else {
			clearInterval(intervalVar);
			$("#name").css("color", "navy");
			$("#drawButton").attr("disabled", false);	
			$("#deltagere").fadeIn();
			setParrot();
			playWinnerSound();
			removeContestant(contestants[currentDrawnNameIdx]);
		}
	}
	
	function setNextName() {
		currentDrawnNameIdx = (currentDrawnNameIdx+1) % numContestants;
		var newName = shuffledContestantArray[currentDrawnNameIdx];
		$("#name").text(newName);
		playSound();
	}
	
	function randomizeArray(o){
		for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	}

	function setParrot() {
		$.getJSON(PARROT_PROVIDER_URL, function(data) {
			processParrots(data);
		});
	}
	
	// Add listeners
	$("#drawButton").click(clickDrawWinner);
	$("#addButton").click(clickAdd);
	
	$("#newName").keyup(function(event){
		if(event.keyCode == 13){
			$("#addButton").click();
		}
	});
	
	// Initialize page elements
	$("#drawButton").focus();
	$("#drawButton").attr("disabled", true);
	
	loadConfig();
	getDefaultContestants();

	
});	