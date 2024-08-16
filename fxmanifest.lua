--[[ FX Information ]]--
fx_version   'cerulean'
use_experimental_fxv2_oal 'yes'
lua54        'yes'
game         'gta5'

--[[ Resource Information ]]--
name         'multichar'
version      '0.0.0'
author       'Bubble'

--[[ Manifest ]]--
shared_scripts {
	'@ox_lib/init.lua',
  '@qbx_core/modules/lib.lua',
}

client_scripts {
	'client/main.lua',
  '@qbx_core/modules/playerdata.lua',
}

server_scripts {
	'@oxmysql/lib/MySQL.lua',
  'server/main.lua',
}

ui_page 'web/build/index.html'

files {
  'web/build/index.html',
  'web/build/**/*',
  'config/client.lua',
  'config/shared.lua',
}