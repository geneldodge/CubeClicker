
// base numbers for damages, crits, etc
var playerLevel = 1;
var enemyLevel = 1;
var skillPoints = 0;
var dpsBaseAmount = 1;
var dmgBaseAmount = 8;
var critMultiplier = 2;
var critChance = .05;
var expReqBaseAmount = 43;
var expRewardBaseAmount = 10;
var enemyBaseTotalHealth = 80;
var healthBarTotalWidth = 150; // match to CSS value
var expBarTotalWidth = 274; // match to CSS value

// skillpoint numbers
var dmgSP = 0;
var dpsSP = 0;
var critMultSP = 0;
var critChanceSP = 0;

// amounts to increase stats by per skill point
var critMultIncrease = 0.1;
var critChanceIncrease = 0.05;
var dpsIncrease = 4;
var dmgIncreaseMult = 2;

// enemy related amounts for enemy levels
var expReqIncreaseConst = 0.02;
var expRewardIncreaseMult = 0.5;
var enemyHealthIncreaseMult = 1.5;

// initialize current values to base values
var dmgCurrAmount = dmgBaseAmount;
var enemyCurrHealth = enemyBaseTotalHealth;
var healthBarCurrWidth = healthBarTotalWidth;
var expReqCurrAmount = expReqBaseAmount;
var expRewardCurrAmount = expRewardBaseAmount;

// initialize other variables accordingly
var dpsTickFrequency = 200; // ms for between dps ticks
var dpsCurrAmount = 0; // initialize to zero
var dpsTicking = false; // only starts ticking when dpsCurrAmount > 0
var expCurrAmount = 0;
var expBarCurrWidth = 0;
var expReqPrevAmount = 0;

$(document).ready(function(){
	
	// attach damage stuff to enemy_square
	$('.enemy_square').on('click', function(){
		$('.enemy_square').animate({width: '95px', height: '95px'}, 40, function(){
			$(this).animate({width: '100px', height: '100px'}, 40);
			// create damage div
			showDamageDone();
			
			// adjust damage to be dealt
			if(checkCrit()) {
				dmgCurrAmount = dmgBaseAmount * critMultiplier;
			} else {
				dmgCurrAmount = dmgBaseAmount;
			}
			
			// subtract damage from enemy health
			dealDamage(dmgCurrAmount);
		});
	});
	
	// attach SP additions to divs
	$('.dmg_sp_cell').on("click", function() {addSP("dmg");});
	$('.dps_sp_cell').on("click", function() {addSP("dps");});
	$('.crit_chance_sp_cell').on("click", function() {addSP("critChance");});
	$('.crit_mult_sp_cell').on("click", function() {addSP("critMult");});
	
	// attach tooltips to divs
	$('.dmg_sp_cell .tooltiptext').text('Click to increase your Click Damage ' + dmgIncreaseMult + 'x.');
	$('.dps_sp_cell .tooltiptext').text('Click to add ' + dpsIncrease + ' to your DPS Amount.');
	$('.crit_chance_sp_cell .tooltiptext').text('Click to add ' + critChanceIncrease + ' to your Critical Chance.');
	$('.crit_mult_sp_cell .tooltiptext').text('Click to add ' + critMultIncrease + ' to your Critical Multiplier.');
	
	// set up player divs
	$(".player_level").text(playerLevel);
	$(".player_exp_text").text("XP : " + formatNum(expCurrAmount,3) + "/" + formatNum(expReqCurrAmount,3));
	$(".player_dmg").text(formatNum(dmgBaseAmount,1));
	$(".player_dps").text(formatNum(dpsCurrAmount,1));
	$(".player_crit_mult").text(formatNum(critMultiplier,2));
	$(".player_crit_chance").text(critChance);
	
	// set initial enemy square
	resetEnemy();
	
	// start ticking DPS
	tickDps();

});

// attempts to add a skill point to given skill
function addSP(addToSkill) {
	// only do stuff if there are skill points
	if (skillPoints > 0) {
		
		// add skill point to skill
		if (addToSkill == "dmg") {
			// update SP count for dmg
			dmgSP += 1;
			$('.dmg_sp_count').text(dmgSP);
			// update damage amount
			dmgBaseAmount = dmgBaseAmount * dmgIncreaseMult;
			dmgCurrAmount = dmgBaseAmount;
			$('.player_dmg').text(formatNum(dmgCurrAmount,1));
		} else if (addToSkill == "dps") {
			// update SP count for dps
			dpsSP += 1;
			$('.dps_sp_count').text(dpsSP);
			
			// special case if DPS is zero
			if (dpsCurrAmount == 0) {
				dpsTicking = true;
			}
			
			// update dps amount
			dpsCurrAmount += dpsIncrease;
			$('.player_dps').text(formatNum(dpsCurrAmount,1));
			
		} else if (addToSkill == "critChance") {
			// update SP count for crit chance
			critChanceSP += 1;
			$('.crit_chance_sp_count').text(critChanceSP);
			// update crit chance amount
			critChance += critChanceIncrease;
			$('.player_crit_chance').text(critChance.toFixed(2));
		} else if (addToSkill == "critMult") {
			// update SP count for crit multiplier
			critMultSP += 1;
			$('.crit_mult_sp_count').text(critMultSP);
			// update crit multiplier amount, rounding to 3 decimal places
			critMultiplier = Math.round((critMultiplier + critMultIncrease) * 1000) / 1000;
			$('.player_crit_mult').text(formatNum(critMultiplier,2));
		}
		
		// subtract spent point
		skillPoints -= 1;
		$('.skill_point_count').text(formatNum(skillPoints,1));
		// toggle off skill point adders if necessary
		if (skillPoints <= 0) {
			toggleSP(); // toggle off 
		}
	}
}

// returns true or false depending on if a critical hit should be made
function checkCrit() {
	var criticalHit = false;
	
	if (Math.random() > (1 - critChance)){
		criticalHit = true;
	}
	
	return criticalHit;
}

// handles adjustments of enemy health bar and related
//   if enemy is supp to die, calls enemyDeath()
function dealDamage(damageToDeal) {
	if ((enemyCurrHealth - damageToDeal) <= 0) {
		enemyDeath();
	} else {
		// subtract dmg from health
		enemyCurrHealth -= damageToDeal;
		// change health_bar text
		if ((enemyCurrHealth % 1) != 0) {
			enemyCurrHealth = enemyCurrHealth.toFixed(1);
		}
		$('.health_bar_text').text(formatNum(enemyCurrHealth,2));
		// calculate new health_bar width
		var subWidth = Math.floor((healthBarTotalWidth / enemyBaseTotalHealth) * damageToDeal);
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
	dpsTicking = false;
	// clear enemy health bar numbers and make it clear for now
	$('.health_bar_text').text('').css({opacity: '0.0'});
	$('.health_bar').css({opacity: '0.0'});
	// animate enemy disappearing
	$('.enemy_square').css({pointerEvents: 'none'}).animate({height: '0px', width: '0px', top: '50px', opacity: '0.0'}, "fast",function(){
		// make enemy unclickable
		setTimeout(resetEnemy, 100);
	});
	
	// calculate xp reward
	var rangeMin = (enemyLevel * expRewardBaseAmount) - 1;
	var rangeMax = rangeMin + 2;
	expRewardCurrAmount = getRandInt(rangeMin, rangeMax);
	
	// award xp to player
	awardXP();
}

// handles changing player xp bar accordingly
function awardXP() {
	// update player xp vars
	expCurrAmount += expRewardCurrAmount;
	
	// check for a level up
	if (expCurrAmount >= expReqCurrAmount) {
		// level player up
		levelUp();
	} else {
		// calculate new XP bar width and apply it
		//  calculates what percentage of current required XP has been accumulated MINUS the prev level amount so that the
		//    XP bar can reset to empty at each level
		var newWidth = Math.floor(expBarTotalWidth * ((expCurrAmount - expReqPrevAmount) / (expReqCurrAmount - expReqPrevAmount)));
		
		// add the width to current xp
		expBarCurrWidth = newWidth;
	}
	
	// change total
	$('.player_exp_text').text("XP : " + formatNum(expCurrAmount,3) + " / " + formatNum(expReqCurrAmount,3));
	
	// adjust fill bar
	$('.player_exp_bar').css({width: expBarCurrWidth});
}

// handles everything necessary for a level-up
function levelUp() {
	// add skill point
	skillPoints += 1;
	$('.skill_point_count').text(formatNum(skillPoints,1));
	
	// enable adding skill points to skills if not enabled
	if (skillPoints == 1) {
		toggleSP();
	}
	
	// change playerLevel
	playerLevel += 1;
	$('.player_level').text(playerLevel);
	
	// change expReqCurrAmount based on NEW playerLevel
	expReqPrevAmount = expReqCurrAmount;
	expReqCurrAmount += Math.floor((playerLevel / expReqIncreaseConst)^2);
	
	// reset expBarCurrWidth
	expBarCurrWidth = 0;
	
	// check if another level should be added
	//  *there is a possibility of player getting > 1 level's worth of XP from some battles
	if (expCurrAmount >= expReqCurrAmount) {
		// level up again
		levelUp();
	}
}

// enables or disable SP buttons
function toggleSP() {
	$('.dmg_sp_cell').toggleClass('sp_inactive sp_active no_pointers');
	$('.dps_sp_cell').toggleClass('sp_inactive sp_active no_pointers');
	$('.crit_chance_sp_cell').toggleClass('sp_inactive sp_active no_pointers');
	$('.crit_mult_sp_cell').toggleClass('sp_inactive sp_active no_pointers');
	$('.skill_point_count').toggleClass('sp_inactive sp_active no_pointers');
}

// reset enemy and health bar attributes
function resetEnemy() {
	// reset enemy health to full
	enemyCurrHealth = enemyBaseTotalHealth;
	healthBarCurrWidth = healthBarTotalWidth;
	
	// reset bar properties and text
	$('.health_bar_text').text(formatNum(enemyCurrHealth,2)).css({opacity: '1.0'});
	$('.health_bar').css({width: healthBarCurrWidth, opacity: '1.0'});
	
	// reset enemy_square stuff
	$('.enemy_square').css({height: '100px', width: '100px', top: '0px', opacity: '1.0', pointerEvents: 'auto', backgroundColor: getRandHexColor()});
	
	// populate the enemies level
	$('.enemy_level_num').text(enemyLevel);
	
	// set dps ticking again if dps > 0
	if (dpsCurrAmount > 0) {
		dpsTicking = true;
	}
}

// creates a dmg_nums div with appropriate dmg amount in it that is animated
function showDamageDone() {
	var dmgFont = "font_dmg";
	
	// check for critical hit/bonus damage
	if (dmgCurrAmount > dmgBaseAmount) {
		// we have greater than normal damage
		dmgFont = "font_crit_dmg";
	}
	
	// create new dmg_nums div
	newDmgDiv = $('<div class="dmg_nums ' + dmgFont + '"></div>');
	
	// attach to dmg_container
	$('.dmg_num_container').append(newDmgDiv);
	
	// animate div
	newDmgDiv.text(formatNum(dmgCurrAmount,1)).animate({top: '0px', left: getRandInt(25,40) + 'px', opacity: '0.5'}, "slow", function(){$(this).remove();});
}

// creates a dps_nums div and animates it every 1 second
function tickDps() {
	
	// only do damage and animations if enemy is alive
	if (dpsTicking) {
		// create new dps_nums div
		newDpsDiv = $("<div></div>", {"class": "dps_nums font_dps_dmg"});
		
		// append div to dmg_container
		$(".dps_num_container").append(newDpsDiv);
		
		// animate div
		newDpsDiv.text(formatNum((dpsCurrAmount / (1000 / dpsTickFrequency)),1)).animate({top: '0px', right: getRandInt(25,40) + 'px', opacity: '0.5'}, "slow", function(){$(this).remove();});
		
		// make changes to health bar
		dealDamage(dpsCurrAmount / (1000 / dpsTickFrequency));
	}
	
		// repeat in 1 second
		dpsTimer = setTimeout(tickDps, dpsTickFrequency);
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
//  NOTE: once number >= 10e+21, goes to scientific notation
function formatNum(number, fixedAmount) {
	var returnNumString;
	
	if (number > 999999999999999999999999999) {
		returnNumString = (number / 1000000000000000000000000).toPrecision(3);
	} else if (number > 999999999999999999999999) {
		returnNumString = (number / 1000000000000000000000000).toFixed(fixedAmount) + "S";
	} else if (number > 999999999999999999999) {
		returnNumString = (number / 1000000000000000000000).toFixed(fixedAmount) + "s";
	} else if (number > 999999999999999999) {
		returnNumString = (number / 1000000000000000000).toFixed(fixedAmount) + "Q";
	} else if (number > 999999999999999) {
		returnNumString = (number / 1000000000000000).toFixed(fixedAmount) + "q";
	} else if (number > 999999999999) {
		returnNumString = (number / 1000000000000).toFixed(fixedAmount) + "T";
	} else if (number > 999999999) {
		returnNumString = (number / 1000000000).toFixed(fixedAmount) + "B";
	} else if (number > 999999) {
		returnNumString = (number / 1000000).toFixed(fixedAmount) + "M";
	} else if (number > 999) {
		returnNumString = (number / 1000).toFixed(fixedAmount) + "K";
	} else {
		returnNumString = number;
	}
	
	return returnNumString;
}

// returns an integer value between min & max
function getRandInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}