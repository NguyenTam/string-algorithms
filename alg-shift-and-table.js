function create_shift_and_table(text, pattern) {
  
    /*Create a occurrence table. Initialize it.*/
    var table = {};
    var current_char;
    var pattern_size = pattern.length

    var chapters = [0];
    var states = [{column:-2,matched:''}, {column:-1,matched:''}];
    for (var i = 0; i < pattern_size; i++) {
        current_char = pattern.charAt(i);
        table[current_char] = {num : 0, arr : new Array(pattern_size + 1).join("0").split("")};  // create an array in pattern_size and every elements are '0'
    }

    var pattern_reversed = pattern.split("").reverse().join("");
    var previous_letter = '';
    for(var i = 0; i < pattern_size; i++) {

        current_char = pattern_reversed.charAt(i);
        table[current_char].arr[pattern_size-1-i] = "1";
        table[current_char].num |= (1<<pattern_size-1-i);

        if(previous_letter!=current_char){
            chapters.push(states.length - 1);
        }
        states.push({column:i,matched:current_char});
        previous_letter = current_char;
    }
    chapters.push(states.length-1);

    return {
        "id":"shift_and_table",
        "name": "Shift-And table",
        "text": text,
        "pattern_reversed": pattern_reversed,
        "pattern" : pattern,
        "shift_and_table": table,
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
            var pattern_size = this.pattern.length;
            var state = this.states[this.current];

            if(state.column==-2){
                                // construct renderable version of text and pattern
                var pat_array = expand_string(this.pattern);

                for(var i = 0 ; i < pattern_size; i++){
                    pat_array[i].cls = "";
                }

                render({
                    "array": pat_array,
                    "pad": pad_info(1),
                }, "#monospace-string", area);

                // select the current state
                for(var key in this.shift_and_table){
                    var row_array = [{"index" : "", "letter" : key, "cls": "", "index_cls":""}];

                    for(var i = 0; i < pattern_size; i++){
                        var cls = "";
                        var letter = "0";
                        row_array.push({
                            "index": i,
                            "letter": letter,
                            "cls": cls,
                            "index_cls": "",
                        });
                    }
                    // render text and pattern
                    render({
                        "array": row_array,
                        "pad": pad_info(0),
                    }, "#monospace-string", area);
                }


            }
            else{
                // construct renderable version of text and pattern
                var pat_array = expand_string(this.pattern_reversed);

                for(var i = 0 ; i < pattern_size; i++){
                    pat_array[i].cls = (state.column==i) ? "cursor" : "";
                    pat_array[i].index = pattern_size - i - 1;
                }

                render({
                    "array": pat_array,
                    "pad": pad_info(1),
                }, "#monospace-string", area);

                // select the current state

                for(var key in this.shift_and_table){
                    var value = this.shift_and_table[key];
                    var row_array = [{"index" : "", "letter" : key, "cls": (key==state.matched) ? "cursor":"", "index_cls":""}];

                    for(var i = 0; i < pattern_size; i++){
                        var cls = "";
                        var letter = value.arr[pattern_size - i - 1];
                        if(state.column < i){
                            letter = "0";
                        }
                        if (state.column >= i){
                            cls = "mismatch";
                            if(letter == "1"){
                                cls = "match";
                            }
                            
                        }
                        row_array.push({
                            "index": i,
                            "letter": letter,
                            "cls": cls,
                            "index_cls": "",
                        });
                    }
                    // render row
                    render({
                        "array": row_array,
                        "pad": pad_info(0),
                    }, "#monospace-string", area);  

                }
            }
        },
    };
}
stralg.story_inits["shift_and_table"] = {
    "constructor": create_shift_and_table,
    "name": "Shift-And table",
    "long_name": "Shift-And table",
    "type": "support",
};
