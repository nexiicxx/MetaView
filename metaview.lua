local json = require("json")

local metaview = {

    enabled = false,
    is_in_game = false,
    stop = false,
}

function metaview.on_loaded()

    local http = fantasy.http()

    http:get(
        "http://localhost:3000/api/health",  
        {},                             
        function( result )              
            fantasy.print("http output ({}): {}", os.clock(), result )
        end
    )

end

local valve_source2 = fantasy.engine.source2()

function metaview.on_worker()

    
    metaview.fetch_player_data()
    


    --[[
        local localplayer = entity_list:get_localplayer()
        
        if localplayer and not is_in_game then
            
            is_in_game = true
            metaview.on_enter_game()
        elseif not localplayer and is_in_game then
            
            is_in_game = false
            metaview.on_leave_game()  
        end
    ]]
end

function metaview.on_enter_game()
    --fantasy.print("player has entered the game")

    
end

local last_execution = 0  -- Store last execution time

function metaview.fetch_player_data()
    local entity_list = fantasy.engine.entity_list()

    local players_data = { }
    local data = { }

    for _, entity in pairs(entity_list:get_players()) do

        local player_pawn = entity:get_pawn() 
        
        local player_health = player_pawn:read( MEM_INT, valve_source2:get_schema("C_BaseEntity", "m_iHealth") )
        local player_team = player_pawn:read( MEM_INT, valve_source2:get_schema( "C_BaseEntity", "m_iTeamNum" ) )
        local player_steam_id = entity:read( MEM_INT, valve_source2:get_schema( "CBasePlayerController", "m_steamID"))
        
        local name_ptr = entity:read( MEM_ADDRESS, valve_source2:get_schema( "CCSPlayerController", "m_sSanitizedPlayerName" ) )
        if not name_ptr then return end

        local player_name = name_ptr:read( MEM_STRING, 0, 32 )

        data = {
            health = player_health,
            team = player_team,
            steamid = player_steam_id,
            name = player_name
        }

        table.insert(players_data, data)
    end

    local current_time = os.clock()

    -- send data each 30 sec
    if current_time - last_execution >= 10 then
        metaview.send_game_data(players_data)

        last_execution = current_time
    end
end

function metaview.send_game_data(players_data)
    local d = json.encode(players_data)
    
    fantasy.log("sending session data...")
    
    fantasy.http():post("http://localhost:3000/api/gamedata", d, { ["Content-Type"] = "application/json" })
end


function metaview.on_leave_game()
    fantasy.print("player has left the game")
end

return metaview