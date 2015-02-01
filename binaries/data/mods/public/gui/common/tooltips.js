const COST_DISPLAY_NAMES = {
	"food": "[icon=\"iconFood\"]",
	"wood": "[icon=\"iconWood\"]",
	"stone": "[icon=\"iconStone\"]",
	"metal": "[icon=\"iconMetal\"]",
	"population": "[icon=\"iconPopulation\"]",
	"time": "[icon=\"iconTime\"]"
};

function damageValues(dmg)
{
	if (!dmg)
		return [0, 0, 0];

	return [dmg.hack || 0, dmg.pierce || 0, dmg.crush || 0];
}

function damageTypeDetails(dmg)
{
	if (!dmg)
		return "[font=\"sans-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.hack.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Hack") + "[/color][/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.pierce.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Pierce") + "[/color][/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.crush.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Crush") + "[/color][/font]"
		}));

	return dmgArray.join(translate(", "));
}

// TODO color/font
function attackRateDetails(entState, type)
{
	var time = entState.attack[type].repeatTime / 1000;
	if (entState.buildingAI) {
		var arrows = Math.max(entState.buildingAI.arrowCount, entState.buildingAI.defaultArrowCount);
		return sprintf(translate("%(arrowString)s / %(timeString)s"), {
			arrowString: sprintf(translatePlural("%(arrows)s arrow", "%(arrows)s arrows", arrows), { arrows: arrows}),
			timeString: sprintf(translatePlural("%(time)s second", "%(time)s seconds", time), { time: time })
		});
	}
	return sprintf(translatePlural("%(time)s second", "%(time)s seconds", time), { time: time });
}

// Converts an armor level into the actual reduction percentage
function armorLevelToPercentageString(level)
{
	return (100 - Math.round(Math.pow(0.9, level) * 100)) + "%";
	// 	return sprintf(translate("%(armorPercentage)s%"), { armorPercentage: (100 - Math.round(Math.pow(0.9, level) * 100)) }); // Not supported by our sprintf implementation.
}

function getArmorTooltip(dmg)
{
	var label = "[font=\"sans-bold-13\"]" + translate("Armor:") + "[/font]";
	if (!dmg)
		return sprintf(translate("%(label)s %(details)s"), {
			"label": label,
			"details": "[font=\"sans-12\"]" + translate("(None)") + "[/font]"
		});

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.hack,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Hack") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.hack) }) + "[/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.pierce,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Pierce") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.pierce) }) + "[/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.crush,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Crush") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.crush) }) + "[/font]"
		}));

	return sprintf(translate("%(label)s %(details)s"), {
		"label": label,
		"details": dmgArray.join("[font=\"sans-12\"]" + translate(", ") + "[/font]")
	});
}

function damageTypesToText(dmg)
{
	if (!dmg)
		return "[font=\"sans-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.hack.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Hack") + "[/color][/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.pierce.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Pierce") + "[/color][/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.crush.toFixed(1),
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Crush") + "[/color][/font]"
		}));

	return dmgArray.join("[font=\"sans-12\"]" + translate(", ") + "[/font]");
}

function getAttackTypeLabel(type)
{
	if (type === "Charge") return translate("Charge Attack:");
	if (type === "Melee") return translate("Melee Attack:");
	if (type === "Ranged") return translate("Ranged Attack:");

	warn(sprintf("Internationalization: Unexpected attack type found with code ‘%(attackType)s’. This attack type must be internationalized.", { attackType: type }));
	return translate("Attack:");
}

function getAttackTooltip(template)
{
	var attacks = [];
	if (!template.attack)
		return "";

	if (template.buildingAI)
		var rateLabel = "[font=\"sans-bold-13\"]" + translate("Interval:") + "[/font]";
	else
		var rateLabel = "[font=\"sans-bold-13\"]" + translate("Rate:") + "[/font]";

	for (var type in template.attack)
	{
		if (type == "Slaughter")
			continue; // Slaughter is not a real attack, so do not show it.
		if (type == "Charge")
			continue; // Charging isn't implemented yet and shouldn't be displayed.

		var rate = sprintf(translate("%(label)s %(details)s"), {
			label: rateLabel,
			details: attackRateDetails(template, type)
		});

		var attackLabel = "[font=\"sans-bold-13\"]" + getAttackTypeLabel(type) + "[/font]";
		if (type != "Ranged")
		{
			attacks.push(sprintf(translate("%(attackLabel)s %(details)s, %(rate)s"), {
				attackLabel: attackLabel,
				details: damageTypesToText(template.attack[type]),
				rate: rate
			}));
			continue;
		}

		var realRange = template.attack[type].elevationAdaptedRange;
		var range = Math.round(template.attack[type].maxRange);
		var rangeLabel = "[font=\"sans-bold-13\"]" + translate("Range:") + "[/font]"
		var relativeRange = Math.round((realRange - range));
		var meters = "[font=\"sans-10\"][color=\"orange\"]" + translate("meters") + "[/color][/font]";

		if (relativeRange) // show if it is non-zero
			attacks.push(sprintf(translate("%(attackLabel)s %(details)s, %(rangeLabel)s %(range)s %(meters)s (%(relative)s), %(rate)s"), {
				attackLabel: attackLabel,
				details: damageTypesToText(template.attack[type]),
				rangeLabel: rangeLabel,
				range: range,
				meters: meters,
				relative: relativeRange > 0 ? "+" + relativeRange : relativeRange,
				rate: rate
			}));
		else
			attacks.push(sprintf(translate("%(attackLabel)s %(damageTypes)s, %(rangeLabel)s %(range)s %(meters)s, %(rate)s"), {
				attackLabel: attackLabel,
				damageTypes: damageTypesToText(template.attack[type]),
				rangeLabel: rangeLabel,
				range: range,
				meters: meters,
				rate: rate
			}));
	}

	return attacks.join(translate(", "));
}

/**
 * Translates a cost component identifier as they are used internally
 * (e.g. "population", "food", etc.) to proper display names.
 */
function getCostComponentDisplayName(costComponentName)
{
	if (costComponentName in COST_DISPLAY_NAMES)
		return COST_DISPLAY_NAMES[costComponentName];

	warn(sprintf("The specified cost component, ‘%(component)s’, is not currently supported.", { component: costComponentName }));
	return "";
}

/**
 * Multiplies the costs for a template by a given batch size.
 */
function multiplyEntityCosts(template, trainNum)
{
	var totalCosts = {};
	for (var r in template.cost)
		totalCosts[r] = Math.floor(template.cost[r] * trainNum);

	return totalCosts;
}

/**
 * Helper function for getEntityCostTooltip.
 */
function getEntityCostComponentsTooltipString(template, trainNum, entity)
{
	if (!trainNum)
		trainNum = 1;

	var totalCosts = multiplyEntityCosts(template, trainNum);
	totalCosts.time = Math.ceil(template.cost.time * (entity ? Engine.GuiInterfaceCall("GetBatchTime", {"entity": entity, "batchSize": trainNum}) : 1));

	var costs = [];
	if (totalCosts.food) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("food"), cost: totalCosts.food }));
	if (totalCosts.wood) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("wood"), cost: totalCosts.wood }));
	if (totalCosts.metal) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("metal"), cost: totalCosts.metal }));
	if (totalCosts.stone) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("stone"), cost: totalCosts.stone }));
	if (totalCosts.population) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("population"), cost: totalCosts.population }));
	if (totalCosts.time) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("time"), cost: totalCosts.time }));
	return costs;
}

/**
 * Returns an array of strings for a set of wall pieces. If the pieces share
 * resource type requirements, output will be of the form '10 to 30 Stone',
 * otherwise output will be, e.g. '10 Stone, 20 Stone, 30 Stone'.
 */
function getWallPieceTooltip(wallTypes)
{
	var out = [];
	var resourceCount = {};

	// Initialize the acceptable types for '$x to $y $resource' mode.
	for (var resource in wallTypes[0].cost)
		if (wallTypes[0].cost[resource])
			resourceCount[resource] = [wallTypes[0].cost[resource]];

	var sameTypes = true;
	for (var i = 1; i < wallTypes.length; ++i)
	{
		for (var resource in wallTypes[i].cost)
		{
			// Break out of the same-type mode if this wall requires
			// resource types that the first didn't.
			if (wallTypes[i].cost[resource] && !resourceCount[resource])
			{
				sameTypes = false;
				break;
			}
		}

		for (var resource in resourceCount)
		{
			if (wallTypes[i].cost[resource])
				resourceCount[resource].push(wallTypes[i].cost[resource]);
			else
			{
				sameTypes = false;
				break;
			}
		}
	}

	if (sameTypes)
	{
		for (var resource in resourceCount)
		{
			var resourceMin = Math.min.apply(Math, resourceCount[resource]);
			var resourceMax = Math.max.apply(Math, resourceCount[resource]);

			// Translation: This string is part of the resources cost string on
			// the tooltip for wall structures.
			out.push(sprintf(translate("%(resourceIcon)s %(minimum)s to %(resourceIcon)s %(maximum)s"), {
				resourceIcon: getCostComponentDisplayName(resource),
				minimum: resourceMin,
				maximum: resourceMax
			}));
		}
	}
	else
		for (var i = 0; i < wallTypes.length; ++i)
			out.push(getEntityCostComponentsTooltipString(wallTypes[i]).join(", "));

	return out;
}

/**
 * Returns the cost information to display in the specified entity's construction button tooltip.
 */
function getEntityCostTooltip(template, trainNum, entity)
{
	// Entities with a wallset component are proxies for initiating wall placement and as such do not have a cost of
	// their own; the individual wall pieces within it do.
	if (template.wallSet)
	{
		var templateLong = GetTemplateData(template.wallSet.templates.long);
		var templateMedium = GetTemplateData(template.wallSet.templates.medium);
		var templateShort = GetTemplateData(template.wallSet.templates.short);
		var templateTower = GetTemplateData(template.wallSet.templates.tower);

		var wallCosts = getWallPieceTooltip([templateShort, templateMedium, templateLong]);
		var towerCosts = getEntityCostComponentsTooltipString(templateTower);

		return sprintf(translate("Walls:  %(costs)s"), { costs: wallCosts.join("  ") }) + "\n"
		       + sprintf(translate("Towers:  %(costs)s"), { costs: towerCosts.join("  ") });
	}

	if (template.cost)
		return getEntityCostComponentsTooltipString(template, trainNum, entity).join("  ");

	return "";
}

/**
 * Returns the population bonus information to display in the specified entity's construction button tooltip.
 */
function getPopulationBonusTooltip(template)
{
	var popBonus = "";
	if (template.cost && template.cost.populationBonus)
		popBonus = "\n" + sprintf(translate("%(label)s %(populationBonus)s"), {
			label: "[font=\"sans-bold-13\"]" + translate("Population Bonus:") + "[/font]",
			populationBonus: template.cost.populationBonus
		});
	return popBonus;
}

/**
 * Returns a message with the amount of each resource needed to create an entity.
 */
function getNeededResourcesTooltip(resources)
{
	var formatted = [];
	for (var resource in resources)
		formatted.push(sprintf(translate("%(component)s %(cost)s"), {
			component: "[font=\"sans-12\"]" + getCostComponentDisplayName(resource) + "[/font]",
			cost: resources[resource]
		}));

	return "\n\n[font=\"sans-bold-13\"][color=\"red\"]" + translate("Insufficient resources:") + "[/color][/font]\n" + formatted.join("  ");
}

function getSpeedTooltip(template)
{
	if (!template.speed)
		return "";

	var label = "[font=\"sans-bold-13\"]" + translate("Speed:") + "[/font]";
	var speeds = [];
	if (template.speed.walk)
		speeds.push(sprintf(translate("%(speed)s %(movementType)s"), { speed: template.speed.walk, movementType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Walk") + "[/color][/font]"}));
	if (template.speed.run)
		speeds.push(sprintf(translate("%(speed)s %(movementType)s"), { speed: template.speed.run, movementType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Run") + "[/color][/font]"}));

	return sprintf(translate("%(label)s %(speeds)s"), { label: label, speeds: speeds.join(translate(", ")) })
}


function getEntityNames(template)
{
	if (template.name.specific)
	{
		if (template.name.generic && template.name.specific != template.name.generic)
			return sprintf(translate("%(specificName)s (%(genericName)s)"), {
				specificName: template.name.specific,
				genericName: template.name.generic
			});
		return template.name.specific;
	}
	if (template.name.generic)
		return template.name.generic;

	warn("Entity name requested on an entity without a name, specific or generic.");
	return translate("???");
}

function getEntityNamesFormatted(template)
{
	var names = "";
	var generic = template.name.generic;
	var specific = template.name.specific;
	if (specific)
	{
		// drop caps for specific name
		names += '[font="sans-bold-16"]' + specific[0] + '[/font]' +
			'[font="sans-bold-12"]' + specific.slice(1).toUpperCase() + '[/font]';

		if (generic)
			names += '[font="sans-bold-16"] (' + generic + ')[/font]';
	}
	else if (generic)
		names = '[font="sans-bold-16"]' + generic + "[/font]";
	else
		names = "???";

	return names;
}

function getVisibleEntityClassesFormatted(template)
{
	var r = ""
	if (template.visibleIdentityClasses && template.visibleIdentityClasses.length)
	{
		r += "\n[font=\"sans-bold-13\"]" + translate("Classes:") + "[/font] ";
		r += "[font=\"sans-13\"]" + translate(template.visibleIdentityClasses[0]) ;
		for (var c = 1; c < template.visibleIdentityClasses.length; c++)
			r += ", " + translate(template.visibleIdentityClasses[c]);
		r += "[/font]";
	}
	return r;
}
