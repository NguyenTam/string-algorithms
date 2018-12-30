

function lcp_elimination(str, i, j) {
    var k = 0;
    var strlen = str.length;
    for(k = 0; k+i < strlen && k+j < strlen; k++) {
        if(str[k+i] != str[k+j])
            return k;
    }
    return k;
}

function create_witness_array(text, pattern) {
    /*
    */
    var states = [{
            "len": 1,
            "r": 0,
            "l": 0,
            "i_prime": 0,
            "i": 0,
            "branch": "",
            "lcp_from": -1,
            "lcp_len": -1,
            "prev": {
                "r": 0,
                "l": 0,
                "i_prime": 0,
                "i": 0,
            },
            }];
    var chapters = [0];
    
    var witness = [];
    var lpa = []; // longest prefix array
    lpa.push(pattern.length);
    var l = 0;
    var r = 0;
    var i_prime = 1;
    // etch algorithm ?
    for(var i = 1; i < pattern.length; i++) {
        var state_prev = {
            "r": r,
            "l": l,
            "i_prime": i_prime,
            "i": i - 1,
        };
        if(i >= r) {
            lpa.push(lcp_elimination(pattern, 0, i));
            l = i
            r = i + lpa[i];
            i_prime = 1;
            states.push({
                "len": i+1,
                "r": r,
                "l": l,
                "i_prime": i_prime,
                "i": i,
                "branch": "i>=r",
                "lcp_from": 0,
                "lcp_len": lpa[i] + 1,
                "prev": state_prev,
            });
        } else { // i < r
            lpa.push(null);
            // i_prime some weird earlier occurence?
            if(lpa[i_prime] < r - i) {
                lpa[i] = lpa[i_prime];
                i_prime += 1;
                states.push({
                    "len": i+1,
                    "r": r,
                    "l": l,
                    "i_prime": i_prime,
                    "i": i,
                    "branch": "w[i']<r-i",
                    "lcp_from": -1,
                    "lcp_len": -1,
                    "prev": state_prev,
                });
            } else { // >= r - i
                var lcp_len = lcp_elimination(pattern, r-i, r);
                lpa[i] = lpa[i_prime] - 1 + lcp_len;
                var tmp = "" + r + " " + i + " " + (r - i);
                l = i
                r = i + lpa[i];
                i_prime += 1;
//                i_prime = 1;
                states.push({
                    "len": i+1,
                    "r": r,
                    "l": l,
                    "i_prime": i_prime,
                    "i": i,
                    "branch": "w[i']>=r-i " + tmp,
                    "lcp_from": state_prev.r - i,
                    "lcp_len": lcp_len + 1,
                    "prev": state_prev,
                });
            }
        }
        chapters.push(states.length-1);
    }
    witness = lpa;
/*    for(var i = 0; i < pattern.length; i++) {
        witness.push(i + lpa[i]);
    }*/
    return {
        "id":"witness_array",
        "name": "Witness Array",
        "text": text,
        "pattern": pattern,
        "witness": witness,

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
            var pat_array2 = expand_string(this.pattern);
            var witness_arr = [];

            // select the current state
            var state = this.states[this.current];

            // reconstruct the state
            for(var i = 0; i < state.len; i++){
                var cls = "";
                witness_arr.push({
                    "index": i,
                    "letter": this.witness[i],
                    "cls": cls,
                    "index_cls": "",
                });
            }
            for(var i = 0; i < pat_array.length; i++){
                if(i >= state.lcp_from && i < state.lcp_from + state.lcp_len) {
                    cls = (i + state.i < pat_array.length && pat_array[i].letter == pat_array[i + state.i].letter) ? "match" : "mismatch";
                    if(pat_array[i].cls == "")
                        pat_array[i].cls = "found";
                    if(i + state.i < pat_array.length)
                        pat_array[i + state.i].cls = cls;
                    pat_array2[i].cls = cls;
                }
            }
            if(state.i > 1) {
                pat_array2 = pat_array2.splice(0, pat_array2.length - state.i);
                pat_array2.push({
                    "index": "",
                    "letter": "…",
                });
            }
            /*
            state_branch = "i>=r";
            state_branch = "i<r&x<r-i";
            state_branch = "i<r&x>=r-i";
            */

            // render text and pattern
            render({
                "array": pat_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": pat_array2,
                "pad": pad_info(state.i),
            }, "#monospace-string", area);
            render({
                "array": witness_arr,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "string": "r: "+(state.prev.r == state.r ?
                    state.r :
                    state.prev.r + " -> " + state.r),
            }, "#auxiliary-string", area);
            render({
                "string": "l: "+(state.prev.l == state.l ?
                    state.l :
                    state.prev.l + " -> " + state.l),
            }, "#auxiliary-string", area);
            render({
                "string": "i: "+(state.prev.i == state.i ?
                    state.i :
                    state.prev.i + " -> " + state.i),
            }, "#auxiliary-string", area);
            render({
                "string": "i': "+(state.prev.i_prime == state.i_prime ?
                    state.i_prime :
                    state.prev.i_prime + " -> " + state.i_prime),
            }, "#auxiliary-string", area);
            render({
                "string": "branch: "+state.branch,
            }, "#auxiliary-string", area);
        },
    };
}
stralg.story_inits["witness_array"] = {
    "constructor": create_witness_array,
    "name": "Witness Array",
    "long_name": "Witness Array",
    "type": "support",
};
