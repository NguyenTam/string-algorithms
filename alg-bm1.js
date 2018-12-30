
function create_bm1(text, pattern) {

    var failure_function = create_bm_array1(text,pattern);

    //Based on Trivial algorithm
    var states = [{jump_by:0,current_tchar:"abc",char_from_dict:"abc",chars_ok:true, ok:false, i:pattern.length,position:0}];
    var chapters = [0];

    for(var position = 0; position < text.length - pattern.length + 1; position++) {
        var ok = true;
        var jump_by = 0;
        var current_tchar;
        var char_from_dict;
        var i = pattern.length - 1;
        for(; i >=0 ; i--) {
            current_tchar = text.charAt(position + i);
            if(current_tchar != pattern.charAt(i)) {
                char_from_dict = "**";
                if (current_tchar in failure_function.table){
                    char_from_dict = current_tchar;
                }
                jump_by = failure_function.table[char_from_dict] - pattern.length + i + 1;
                ok = false;
                states.push({jump_by:jump_by,current_tchar:current_tchar, current_pchar:pattern.charAt(i) ,char_from_dict:char_from_dict,chars_ok:false,ok:false, i:i,position:position});
                break;
            }
            else{
                states.push({jump_by:0,current_tchar:current_tchar, current_pchar:pattern.charAt(i), char_from_dict:char_from_dict,chars_ok:true, ok:false, i:i,position:position});
            }
        }
        if(ok) {
            states.push({jump_by:jump_by,current_tchar:current_tchar, current_pchar:undefined,char_from_dict:char_from_dict,chars_ok:true, ok:ok, i:i,position:position});
        }
        position += Math.max(0,jump_by - 1);
        chapters.push(states.length - 1);
    }
    console.log(states);
    return {
        "id" : "bm1",
        "name": "BM1",
        "text": text,
        "pattern": pattern,

        "supports": [failure_function],
        "failure_function" : failure_function,

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

            // select the current state
            var state = this.states[this.current];
            var shift = state.jump_by;
            var compare_length = state.i;
            var is_match = state.ok;


            var bor_array = [];
            render({
                "string": "Boyer Array 1",
            }, "#auxiliary-string", area);
            for(var key in this.failure_function.table){
                var value = this.failure_function.table[key];
                console.log(state.chars_ok,key, state.char_from_dict);
                var row_array = [{"index" : "", "letter" : key, "cls": (state.chars_ok==false && state.char_from_dict==key)? "cursor" : "", "index_cls":""},
                                 {"index" : "", "letter" : value, "cls": (state.chars_ok==false && state.char_from_dict==key) ? "found" : ""}];
                // render text and pattern
                render({
                    "array": row_array,
                    "pad": pad_info(0),
                }, "#monospace-string", area);
            }

            render({},"#horizontal-rule",area);

            render({
                "string": "BM algorithm1",
            }, "#auxiliary-string", area);

            var text_array = expand_string(this.text);
            var pat_array = expand_string(this.pattern);

            for(var i = this.pattern.length-1; i>=state.i && i>=0; i--) {
                if(is_match==true){
                    text_array[state.position + i].cls = "found";
                    pat_array[i].cls = "found";
                }
                else if(this.text.charAt(state.position + i) == this.pattern.charAt(i)){
                    text_array[state.position + i].cls = "match";
                    pat_array[i].cls="match";
                }
                else{
                    text_array[state.position + i].cls = "mismatch";
                    text_array[state.position + i].letter_cls = "cursor";
                    pat_array[i].cls = "mismatch";
                    
                }
            }
            // render text and pattern
            render({
                "array": text_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": pat_array,
                "pad": pad_info(state.position),
            }, "#monospace-string", area);

            if(state.chars_ok == false){
              var jump_by = Math.max(1,failure_function.table[state.char_from_dict] - this.pattern.length + state.i + 1);
              render({
                        "string": "Jump by " + jump_by + " ( max(1, " + failure_function.table[state.char_from_dict]+ " - " + this.pattern.length + " + " + state.i + " + 1 "+ ") )" ,
                    }, "#auxiliary-string", area);
            }
        },
    };
}
stralg.story_inits["bm1"] = {
    "constructor": create_bm1,
    "name": "BM1",
    "long_name": "Boyer Moore1",
    "type": "exact",
};
