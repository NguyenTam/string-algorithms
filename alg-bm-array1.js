function create_bm_array1(text, pattern) {
  
    
    
    var current_char;
    var pattern_size = pattern.length;
    var table  = {"**":pattern_size};
    for (var i = 0; i < pattern_size; i++) {
        current_char = pattern.charAt(i);
        table[current_char] = -1;
    }
    var states = [{table:jQuery.extend({},table),index:-1, current_char:"",skip:false}];
    var chapters = [0];
    var match = false;
    var border = [0];
    for(var i = pattern_size-1; i>=0 ; i--) {
        current_char = pattern.charAt(i);
        if(table[current_char] == -1){
            table[current_char] = pattern_size - i - 1;
            states.push({table:jQuery.extend({},table),index:i, current_char:current_char,skip:false});
        }
        else{
            states.push({table:jQuery.extend({},table),index:i, current_char:current_char, skip:true});
        }
        chapters.push(states.length-1);
    }
    return {
        "id" : "bm_array1",
        "name": "BM Array1",
        "text": text,
        "pattern": pattern,

        "border_array": border,
        "states": states,
        "chapters": chapters,
        "current": 0,
        "current_chapter": 0,
	    "table":table,

        "next_chapter": generic_next_chapter,
        "prev_chapter": generic_prev_chapter,
        "next_step": generic_next_step,
        "prev_step": generic_prev_step,
        "start" : generic_start,
        "end" : generic_end,

        "render": function(area_target) {
            var area = $(area_target);
            area.empty();
            var state = this.states[this.current];
            // construct renderable version of text and pattern
            var pat_array = expand_string(this.pattern);
            if(state.index>=0){
                pat_array[state.index].cls = "cursor";
            }
            render({
                "array": pat_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);

            for(var key in state.table){
                var value = state.table[key];
                var row_array = [{"index" : "", "letter" : key, "cls": (key == state.current_char)? "cursor" : "", "index_cls":""},
                                {"index" : "", "letter" : value, "cls": key == state.current_char ? (state.skip ? "mismatch" : "match") : "", "index_cls":""}];
                // render text and pattern
                render({
                    "array": row_array,
                    "pad": pad_info(0),
                }, "#monospace-string", area);
            }
        },
    };
}
stralg.story_inits["bm_array1"] = {
    "constructor": create_bm_array1,
    "name": "BM Array1",
    "long_name": "Boyer Moore Array1",
    "type": "support",
};
