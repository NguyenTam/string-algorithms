var pattern_size;
var p;
var base = 256;  

function getRandomPrimeNumber(){
    var prime_list = [0x7f001b, 0x7f7,0x7, 0x25];
    return prime_list[Math.floor(Math.random()*prime_list.length)];
}
function RK_hash(part){
    var sum = 0;

    var factor = 1;
    for (var i = pattern_size - 1; i >= 0; i--) {
        sum =  sum + part.charCodeAt(i) * (factor) ;
        sum = sum % p;
        factor = factor * base % p;
    }
    return sum;
}

function create_rk(text, pattern) {

    p = getRandomPrimeNumber();
    pattern_size = pattern.length;
    var phash = RK_hash(pattern);
    var subthash = RK_hash(text.slice(0,pattern_size)); //subthash = sub text hash, length of pattern_size per each
    var states = [{subthash:subthash, position:0, cmp_len:-1, matched: false}];
    var chapters = [0];
    var ok = true;

    var factor = 1;
    for (var round = 0;round < pattern_size - 1;round++){
        factor = factor * base % p;
    }

    console.log("factor :" + factor.toString(16));
    for(var position = 0; position < text.length - pattern_size + 1; position++) {
        console.log("index: " + position + "| Hashes= "+ subthash.toString(16) + " : " + phash.toString(16));
    	if(phash == subthash){
    	    ok = true;
    	}
    	else{
    	    ok = false;
    	}
    	states.push({subthash:subthash,position:position, cmp_len:pattern_size-1, matched: ok});
        chapters.push(states.length - 1);
        subthash = (subthash - text.charCodeAt(position)*factor)%p;
        subthash = subthash << 8;
        subthash = subthash + text.charCodeAt(position+pattern_size);
        subthash %= p;
        subthash = (p+subthash)%p; //keep in positive number
    }
    return {
        "id" : "rk",
        "name": "RK",
        "text": text,
        "pattern": pattern,

        "pattern_hash":phash,

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
            var text_array = expand_string(this.text);
            var pat_array = expand_string(this.pattern);

            // select the current state
            var state = this.states[this.current];
            var shift = state.position;
            var compare_length = state.cmp_len;
            var is_match = state.matched;

            // reconstruct the state
            if(is_match) {
                for(var i = 0; i < compare_length + 1; i++) {
                    text_array[shift + i].cls = "found";
                    pat_array[i].cls = "found";
                }
            } else {
                var compare = [];
                for(var i = 0; i < compare_length + 1; i++) {
                    compare.push(shift + i);
                }
                add_match_classes(text_array, pat_array, shift, compare);
            }

            // render text and pattern
            render({
                "array": text_array,
                "pad": pad_info(0),
            }, "#monospace-string", area);
            render({
                "array": pat_array,
                "pad": pad_info(shift),
            }, "#monospace-string", area);


            render({
                "string": (compare_length==-1) ? "hash() = " : ("hash("+this.text.slice(shift,pattern_size + shift)+") = " +state.subthash),
                "cls" : is_match ? "found" : "mismatch",
            }, "#auxiliary-string", area);

            render({
                "string": "hash("+ this.pattern+") = " +this.pattern_hash,
                "cls" : is_match ? "found" : "mismatch",
            }, "#auxiliary-string", area);

            render({
                "string": "Prime = "+ p,
            }, "#auxiliary-string", area);
        },
    };
}
stralg.story_inits["rk"] = {
    "constructor": create_rk,
    "name": "RK",
    "long_name": "Rabin-Karp",
    "type": "exact",
};
