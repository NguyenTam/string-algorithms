function create_shift_and(text, pattern) {
    var states = []; //[{operand:0, operator:'',i:-1,nda_s_previous:0,nda_s:0, current_char:"a"}];
    var chapters = [0];


    /*Create a occurrence table. Initialize it.*/
    var table_object = create_shift_and_table(text,pattern);
    var table = table_object.shift_and_table;

    var nda_state = 0;
    var current_char = '';
    var operand_value = "";
    var matched = 1 << pattern.length - 1;
    for(var position = 0; position < text.length; position++) {
        current_char = text.charAt(position);
        states.push({operand:operand_value, operator:'start',i:position,nda_s:nda_state, current_char:current_char});
        states.push({operand:1, operator:'<<',i:position,nda_s_previous:nda_state,nda_s:nda_state<<1, current_char:current_char});
        nda_state = nda_state << 1;
        
        states.push({operand:1, operator:'+',i:position,nda_s_previous:nda_state, nda_s:nda_state+1, current_char:current_char});
        nda_state = nda_state + 1;
        

        if (contains_key(table,current_char)){
            operand_value = table[current_char].num;
        }
        else{
            operand_value = 0;
        }
        states.push({operand:operand_value, operator:'&',i:position,nda_s_previous:nda_state, nda_s:nda_state & operand_value, current_char:current_char});
        nda_state = nda_state & operand_value;


        if (nda_state & matched){
            states.push({operand:0, operator:'matched',i:position,nda_s:nda_state, current_char:current_char});
        }
        chapters.push(states.length - 1);
    }
    return {
        "id":"shift_and",
        "name": "Shift-And",
        "text": text,
        "pattern": pattern,
        "supports": [table_object],
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

            // select the current state
            var state = this.states[this.current];

            var pattern_size = this.pattern.length;

            var bor_array = [];
            render({
                "string": "Shift-And table",
            }, "#auxiliary-string", area);

            for(var key in this.shift_and_table){
                var value = this.shift_and_table[key];
                var letter_class = (state.current_char==key && state.operator=="&");
                var row_array = [{"index" : "", "letter" : key, "cls": (letter_class ? "cursor" : "") , "index_cls":""}];

                for(var i = 0; i < pattern_size; i++){
                    var cls = (state.operator=="&") ? "found" : "" ;
                    var letter = value.arr[pattern_size - i - 1];
                    row_array.push({
                        "index": i,
                        "letter": letter,
                        "cls":  (letter_class ? "found":""),
                        "index_cls": "",
                    });
                }
                // render text and pattern
                render({
                    "array": row_array,
                    "pad": pad_info(0),
                }, "#monospace-string", area);
            }

            render({},"#horizontal-rule",area);

            render({
                "string": "Shift-And Algorithm",
            }, "#auxiliary-string", area);

            // construct renderable version of text and pattern
            var text_array = expand_string(this.text);
            for(var i = 0 ; i < this.text.length;i++){
                
                if(state.operator == "matched" && i <= state.i && state.i-pattern_size < i){
                    text_array[i].cls = "found";
                }
                else{
                    text_array[i].cls = "";
                    if(i == state.i) text_array[i].cls = "cursor";
                }
            }

            var pat_array = [];
            


            for (var i = pattern_size - 1; i >= 0;i--) {
                pat_array.push({
                "letter": this.pattern.charAt(i),
                "index": i,
                "cls": (state.nda_s&1<<i)? "cursor" : "",
                "letter_cls": "",
                "index_cls": "",
                });
            }

            // render text and pattern
            render({
                "array": text_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": pat_array,
                "pad": pad_info(2),
            }, "#monospace-string", area);


            var start_point = this.current;
            while(true){
                if(this.states[start_point].operator == "start"){
                    break;
                }
                start_point--;
            }


            for(start_point;start_point <= this.current;start_point++){

                var state = this.states[start_point];
                var letter_class = state.operator=="&";
                var previous_result =[];
                var operand_arr =[{"letter":state.operator,"cls":(letter_class ? "cursor" : "")}];
                var current_result = [];            
                for(var i = pattern_size ; i>=0;i--){

                    previous_result.push({
                        "letter": (state.nda_s_previous&(1<<i)) ? 1 : 0,
                        "index": i,
                        "cls": "",
                        "letter_cls": "",
                        "index_cls": "",
                    });
                    operand_arr.push({
                        "letter": (state.operand&(1<<i)) ? 1 : 0,
                        "index": i,
                        "cls": (i!=pattern_size && letter_class) ? "found" : "",
                        "letter_cls": "",
                        "index_cls": "",
                    });

                    current_result.push({
                        "letter": (state.nda_s&(1<<i)) ? 1 : 0,
                        "index": i,
                        "cls": "",
                        "letter_cls": "",
                        "index_cls": "",
                    });
                }
                if(state.operator=="start"){
                    render({
                        "array": current_result,
                        "pad": pad_info(1),
                    }, "#monospace-string", area);

                }
                else if (state.operator!="matched"){
                    render({
                        "array": operand_arr,
                        "pad": pad_info(0),
                    }, "#monospace-string", area);

                    render({},"#horizontal-rule",area);

                    render({
                        "array": current_result,
                        "pad": pad_info(1),
                    }, "#monospace-string", area);

                }
            }
        },
    };
}
stralg.story_inits["shift_and"] = {
    "constructor": create_shift_and,
    "name": "Shift-And",
    "long_name": "Shift-And",
    "type": "exact",
};
