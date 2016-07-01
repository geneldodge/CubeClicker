var ticks = 0;
var dpsAmount = 12;
var dmgBaseAmount = 34;
var dmgCurrAmount = dmgBaseAmount;
var critMultiplier = 2;
var critChance = .15;
var enemyTotalHealth = 358;
var enemyCurrHealth = enemyTotalHealth;
var healthBarTotalWidth = 145;
var healthBarCurrWidth = healthBarTotalWidth;
var enemyAlive = true;

$(document).ready(function(){
	// attach damage stuff to enemy_square
	$('.enemy_square').on('click', function(){
		$('.enemy_square').animate({width: '95px', height: '95px'}, 40, function(){
			$(this).animate({width: '100px', height: '100px'}, 40);
			// create damage div
			showDamageDone();
			// subtract damage from enemy health
			dealDamage(dmgCurrAmount);
		});
	});
	
	// set initial enemy square color
	$('.enemy_square').css({backgroundColor: getRandHexColor()});
	
	// set initial health_bar text
	$('.health_bar').text(enemyCurrHealth);
	
	// start ticking DPS
	tickDps();
});

// handles adjustments of enemy health bar and related
//   if enemy is supp to die, calls enemyDeath()
function dealDamage(damageToDeal) {
	if ((enemyCurrHealth - damageToDeal) <= 0) {
		enemyDeath();
	} else {
		// subtract dmg from health
		enemyCurrHealth -= damageToDeal;
		// change health_bar text
		$('.health_bar').text(enemyCurrHealth);
		// calculate new health_bar width
		var subWidth = Math.floor((healthBarTotalWidth / enemyTotalHealth) * damageToDeal);
		// change health_bar width
		if (subWidth <= 0) {
			subWidth = 1; // 1px is smallest amount to subtract
		}
		// change healthBarCurrWidth
		healthBarCurrWidth -= subWidth;
		// change css to reflect new width
		$('.health_bar').css({width: healthBarCurrWidth});
	}
}

// handles the death animation and resetting of variables
function enemyDeath() {
	// toggle bool to stop dps ticks
	enemyAlive = false;
	// clear enemy health bar numbers and make it clear for now
	$('.health_bar').text('').css({opacity: '0.0'});
	// animate enemy disappearing
	$('.enemy_square').css({pointerEvents: 'none'}).animate({height: '0px', width: '0px', top: '50px', opacity: '0.0'}, function(){
		// make enemy unclickable
		setTimeout(resetEnemy, 200);
	});
}

// reset enemy and health bar attributes
function resetEnemy() {
	// reset enemy health to full
	enemyCurrHealth = enemyTotalHealth;
	healthBarCurrWidth = healthBarTotalWidth;
	// reset bar properties and text
	$('.health_bar').text(enemyCurrHealth).css({width: healthBarCurrWidth, opacity: '1.0'});
	
	// reset enemy_square stuff
	$('.enemy_square').css({height: '100px', width: '100px', top: '0px', opacity: '1.0', pointerEvents: 'auto', backgroundColor: getRandHexColor()});
	
	// set enemy back to alive for dps ticking
	enemyAlive = true;
}

// creates a dmg_nums div with appropriate dmg amount in it that is animated
function showDamageDone() {
	// create new dmg_nums div
	newDmgDiv = $('<div class="dmg_nums font_dmg"></div>');
	
	// attach to dmg_container
	$('.dmg_num_container').append(newDmgDiv);
	
	// animate div
	newDmgDiv.text(formatNum(dmgCurrAmount)).animate({top: '0px', opacity: '0.5'}, "slow", function(){$(this).remove();});
}

// creates a dps_nums div and animates it every 1 second
function tickDps() {
	
	if (enemyAlive) {
		// create new dps_nums div
		newDpsDiv = $("<div></div>", {"class": "dps_nums font_dps_dmg"});
		
		// append div to dmg_container
		$(".dps_num_container").append(newDpsDiv);
		
		// animate div
		newDpsDiv.text(formatNum(dpsAmount)).animate({top: '0px', opacity: '0.5'}, "slow", function(){$(this).remove();});
		
		// make changes to health bar
		dealDamage(dpsAmount);
		
		// repeat in 1 second
		dpsTimer = setTimeout(tickDps, 1000);
	}
}

// returns a random six digit hex color value for the enemy
function getRandHexColor() {
	// code taken from : http://www.paulirish.com/2009/random-hex-color-code-snippets/
	// THANKS PAUL!
	return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// returns a string version of the number
//   truncates large numbers and appends a character
//     ie. 1000 becomes "1K"
//         1000000 becomes "1M"
//  NOTE: largest val javascript can handle:
//          9,007,199,254,740,991 (~9 Quadrillion)
function formatNum(number) {
	var returnNumString;
	
	if (number > 999999999999999999) {
		returnNumString = (number / 1000000000000000000).toFixed(1) + "Q";
	} else if (number > 999999999999999) {
		returnNumString = (number / 1000000000000000).toFixed(1) + "q";
	} else if (number > 999999999999) {
		returnNumString = (number / 1000000000000).toFixed(1) + "T";
	} else if (number > 999999999) {
		returnNumString = (number / 1000000000).toFixed(1) + "B";
	} else if (number > 999999) {
		returnNumString = (number / 1000000).toFixed(1) + "M";
	} else if (number > 999) {
		returnNumString = (number / 1000).toFixed(1) + "K";
	} else {
		returnNumString = number;
	}
	
	return returnNumString;
}