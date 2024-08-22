local config = require 'config.server'

local starterItems = { -- Character starting items
  { name = 'phone', amount = 1 },
  { 
    name = 'id_card', 
    amount = 1, 
    metadata = function(source)
      if GetResourceState('qbx_idcard') ~= 'started' then
        error('qbx_idcard resource not found. Required to give an id_card as a starting item')
      end
      return exports.qbx_idcard:GetMetaLicense(source, {'id_card'})
    end
  },
  { 
    name = 'driver_license', 
    amount = 1, 
    metadata = function(source)
      if GetResourceState('qbx_idcard') ~= 'started' then
        error('qbx_idcard resource not found. Required to give an id_card as a starting item')
      end
      return exports.qbx_idcard:GetMetaLicense(source, {'driver_license'})
    end
  },
}

local function fetchPlayerSkin(citizenId)
  return MySQL.single.await('SELECT * FROM playerskins WHERE citizenid = ? AND active = 1', {citizenId})
end

local function fetchAllPlayerEntities(license2, license)
  local chars = {}
  local result = MySQL.query.await('SELECT * FROM players WHERE license = ? OR license = ?', {license, license2})

  for i = 1, #result do
    local charinfo = json.decode(result[i].charinfo)
    chars[i] = {
      citizenid = '',
      name = '',
      cid = 0,
      metadata = {}
    }
    chars[i].citizenid = result[i].citizenid
    chars[i].name = charinfo.firstname .. ' ' .. charinfo.lastname
    chars[i].cid = charinfo.cid
    chars[i].metadata = {
      { key = "job", value = json.decode(result[i].job).label .. ' (' .. json.decode(result[i].job).grade.name .. ')' },
      { key = "nationality", value = charinfo.nationality },
      { key = "bank", value = lib.math.groupdigits(json.decode(result[i].money).bank) },
      { key = "cash", value = lib.math.groupdigits(json.decode(result[i].money).cash) },
      { key = "birthdate", value = charinfo.birthdate },
      { key = "gender", value = charinfo.gender == 0 and 'Male' or 'Female' },
    }
  end

  return chars
end

---@param source Source
local function giveStarterItems(source)
  	if GetResourceState('ox_inventory') == 'missing' then return end
	while not exports.ox_inventory:GetInventory(source) do
		Wait(100)
	end
	for i = 1, #starterItems do
		local item = starterItems[i]
		if item.metadata and type(item.metadata) == 'function' then
			exports.ox_inventory:AddItem(source, item.name, item.amount, item.metadata(source))
		else
			exports.ox_inventory:AddItem(source, item.name, item.amount, item.metadata)
		end
	end
end

local function getAllowedAmountOfCharacters(license2, license)
    return config.playersNumberOfCharacters[license2] or license and config.playersNumberOfCharacters[license] or config.defaultNumberOfCharacters
end

lib.callback.register('bub-multichar:server:getCharacters', function(source)
  local license2, license = GetPlayerIdentifierByType(source, 'license2'), GetPlayerIdentifierByType(source, 'license')
  local chars = fetchAllPlayerEntities(license2, license)
  local allowedAmount = getAllowedAmountOfCharacters(license2, license)
  
  local sortedChars = {}
  
  for i = 1, allowedAmount do
    sortedChars[i] = nil
  end

  for i = 1, #chars do
    local char = chars[i]
    sortedChars[i] = char
  end

  return sortedChars, allowedAmount
end)

lib.callback.register('bub-multichar:server:getPreviewPedData', function(_, citizenId)
  local ped = fetchPlayerSkin(citizenId)
  if not ped then return end

  return ped.skin, ped.model and joaat(ped.model)
end)

lib.callback.register('bub-multichar:server:loadCharacter', function(source, citizenId)
  local success = exports.qbx_core:Login(source, citizenId)
  if not success then return end

  exports.qbx_core:SetPlayerBucket(source, 0)
  lib.print.info(('%s (Citizen ID: %s) has successfully loaded!'):format(GetPlayerName(source), citizenId))
end)

---@param data unknown
---@return table? newData
lib.callback.register('bub-multichar:server:createCharacter', function(source, data)
  local newData = {}
  newData.charinfo = data

  local success = exports.qbx_core:Login(source, nil, newData)
  if not success then return end

  giveStarterItems(source)
  exports.qbx_core:SetPlayerBucket(source, 0)

  lib.print.info(('%s has created a character'):format(GetPlayerName(source)))
  return newData
end)

lib.callback.register('bub-multichar:server:setCharBucket', function(source)
  exports.qbx_core:SetPlayerBucket(source, source)
  assert(GetPlayerRoutingBucket(source) == source, 'Multicharacter bucket not set.')
end)

RegisterNetEvent('bub-multichar:server:deleteCharacter', function(citizenId)
  local src = source
  exports.qbx_core:DeleteCharacter(citizenId)
  exports.qbx_core:Notify(src, 'Successfully deleted your character', 'success')
end)
