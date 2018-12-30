
/**
 * Render a handlebars template with given fields to some target.
 *
 * Caching for the compiled templates could be implemented for additional
 * efficiency.
 */
function render(fields, tpl, target) {
    var template = Handlebars.compile($(tpl).html());
    var content = template(fields);
    $(target).append(content);
}

/**
 * True if the object contains the key.
 */
function contains_key(obj, val) {
    if(obj.hasOwnProperty(val))
        return true;
    return false;
}

/**
 * Converts a string into a renderable string (or array of objects describing a
 * slot in monospace string).
 *
 * However, often written inlined, because we wanted something a bit different.
 */
function expand_string(str) {
    var arr = [];
    for(var i = 0; i < str.length; i++) {
        arr.push({
            "letter": str.charAt(i),
            "index": i,
            "cls": "",
            "letter_cls": "",
            "index_cls": "",
        });
    }
    return arr;
}

/**
 * Compares defined parts of two renderable strings possibly with some shifting
 * between them. Adds corresponding cls fields to the matched area.
 *
 * However, often written inlined, because we wanted something a bit different.
 */
function add_match_classes(text_array, pat_array, shift, compare) {
    var text_length = text_array.length;
    var pattern_length = pat_array.length;
    for(var i = 0; i < text_length; i++) {
        var cls = "";
        if($.inArray(i, compare) != -1) {
            if(text_array[i].letter == pat_array[i - shift].letter) {
                cls = "match";
            } else {
                cls = "mismatch";
            }
        }
        text_array[i].cls = cls;
        if(i - shift >= 0 && i - shift < pattern_length) {
            pat_array[i - shift].cls = cls;
        }
    }
}

/**
 * Returns structure used for shifting the monospace string right the given
 * amount of slots.
 */
function pad_info(slots) {
    var arr = [];
    for(var i = 0; i < slots; i++) {
        arr.push(1);
    }
    return arr;
}

// global variable containing the state of this string algorithm project and
// constructors for algorithm objects.
var stralg = {
    "main_story": null,
    "story_inits": {},
};

/**
Algorithm object interface:

Add algorithms initializers and general information into stralg.story_inits
(look alg-trivial.js for example)

Information for stralg.story_inits:
    name            : name of the algorithm
    long_name       : long version of the name (used for the select)
    type            : type of the algorithm. e.g. exact
    constructor     : initializer function

The returned algorithm object needs to have:
    id              : id of the algorithm in story_inits
//    name            : name of the algorithm
    text            : the input text
    pattern         : the input pattern
    next_step       : function to move one step forward
    prev_step       : function to move one step backwards
    next_chapter    : function to move one pattern location forward
    prev_chapter    : function to move one pattern location backwards
    start           : function to jump to the beginning
    end             : function to jump to the end
    render          : function to redraw the simulation state

*/

/**
One implementation for state changing for algorithms. Use these for the
corresponding fields in the algorithm object and include following fields:
    states          : list of state objects
    chapters        : list of indices to states list corresponding to the stops
                      of larger jumps
    current         : current step of the simulation
    current_chapter : current chapter of the simulation
 */
function generic_next_step() {
    this.current++; //stepper's current
    if(this.current >= this.states.length)
        this.current--;
    if(this.current_chapter + 1 < this.chapters.length &&
            //each chapter contains a starting step. and chapter index
            this.chapters[this.current_chapter + 1] <= this.current) {
        this.current_chapter++;
    }
}
function generic_prev_step() {
    this.current--;
    if(this.current < 0)
        this.current++;
    if(this.current_chapter > 0 &&
            this.chapters[this.current_chapter] > this.current) {
        this.current_chapter--;
    }
}
function generic_next_chapter() {
    if(this.current_chapter + 1 < this.chapters.length) {
        this.current_chapter++;
        this.current = this.chapters[this.current_chapter];
    }
}
function generic_prev_chapter() {
    if(this.current_chapter > 0 && this.current == this.chapters[this.current_chapter]) {
        this.current_chapter--;
    }
    this.current = this.chapters[this.current_chapter];
}

function generic_start() {
    this.current_chapter=0;
    this.current = 0;
}

function generic_end() {
    this.current_chapter=this.chapters.length-1;
    this.current = this.states.length-1;
}
