function create_border_array(text, pattern) {
  
    var states = [[0, 0, 1, false]];
    var chapters = [0];
    var match = false;
    var border = [0];
    for(var i = 1; i < pattern.length; i++) {
        var j_origin = i - 1;
        var j = border[i-1];
        while(pattern[j] != pattern[i] && j > 0) {
            states.push([i,j, i,false, j_origin]);
            j_origin = j - 1;
            j = border[j-1];
        }
        if(pattern[j] == pattern[i]) {
            match = true;
            border.push(j+1);
        } else {
            match = false;
            border.push(0);
        }
        states.push([i,j, i,match, j_origin]);
        states.push([i,j, i+1,match, j_origin]);
        chapters.push(states.length-1);
    }
    return {
        "id" : "border_array",
        "name": "Border Array",
        "text": text,
        "pattern": pattern,

        "border_array": border,
        "states": states,
        "chapters": chapters,
        "current": 0,
        "current_chapter": 0,

        "next_chapter": generic_next_chapter,
        "prev_chapter": generic_prev_chapter,
        "next_step": generic_next_step,
        "prev_step": generic_prev_step,
        "start" : generic_start,
        "end" : generic_end,

        "render": function(area_target) {
            var area = $(area_target);
            area.empty();

            // construct renderable version of text and pattern
            var pat_array = expand_string(this.pattern);
            var bor_array = [];
            // select the current state
            var state = this.states[this.current];
            var index_i = state[0];
            var index_j = state[1];
            var border_length = state[2];
            var is_match = state[3];
            var j_origin = state[4];
            for(var i = 0; i < border_length; i++){
                var cls = (i == j_origin) ? "cursor" : "";
                bor_array.push({
                    "index": i,
                    "letter": this.border_array[i],
                    "cls": cls,
                    "index_cls": "",
                });
            }

            // reconstruct the state
            pat_array[index_j].cls = (is_match) ? "match":"mismatch";
            pat_array[index_i].cls = "cursor";
            if(index_j != index_i)
                pat_array[index_j].index_cls = "cursor";

            
            // render text and pattern
            render({
                "array": pat_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": bor_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
        },
    };
}
stralg.story_inits["border_array"] = {
    "constructor": create_border_array,
    "name": "Border Array",
    "long_name": "Border Array",
    "type": "support",
};
