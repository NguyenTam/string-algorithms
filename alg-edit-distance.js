function compare_vector(list,v2){
    for(var i in list){
        var p = list[i];
        if(p[0]==v2[0] && p[1]==v2[1])
            return true;
    }
    return false;

}

function create_edit_distance(text, pattern) {
    var states = [{}];
    var chapters = [0];

	var p_length = pattern.length;
    var t_length = text.length;
	var edit_table = new Array();
    
	/*declare edit distance table*/
    for(var i=0;i <= p_length;i++){
        edit_table[i] = new Array();
    }

    /*initialize edit distance table*/
    for (var i=0;i<=p_length;i++){
        edit_table[i][0] = i;
    }
    for(var j=0;j <= t_length; j++){
        edit_table[0][j] = j;
    }

    /*Calculate the table*/
    var cost;
    var smallest_cost;
    for(var i = 1; i <= p_length; i++) {
        for(var j = 1; j <= t_length; j++) {
            cost = 1;
            if (text.charAt(j-1) == pattern.charAt(i-1)){
                cost = 0;
                //alert("i: " + i +"j :" +j);
            }
            smallest_cost = edit_table[i-1][j-1] + cost;
            
            var smallest = [[i-1,j-1]];

            if (edit_table[i][j-1] + 1 < smallest_cost){
                smallest_cost = edit_table[i][j-1] + 1;
                smallest = [[i,j-1]];
            }
            else if (edit_table[i][j-1] + 1 == smallest_cost){
                smallest.push([i,j-1]);
            }


            if (edit_table[i-1][j]+1 < smallest_cost){
                smallest_cost = edit_table[i-1][j] + 1
                smallest = [[i-1,j]];
            }
            else if (edit_table[i-1][j] + 1 == smallest_cost){
                smallest.push([i-1,j]);
            }
            edit_table[i][j] = smallest_cost;
            states.push({backtrace:false, i:i,j:j,smallest:smallest, free:(cost==0)});
        }
        chapters.push(states.length - 1);
    }


    /*backtrace*/
    //vector = {i:p_length,j=t_length}
    var i = p_length;
    var j = t_length;
    var path = [[i,j]];
    var choose_randomly;
    while(i>0 || j>0){
        cost = 1;
        if (text.charAt(j-1) == pattern.charAt(i-1)){
            cost = 0;
        }
        var smallest = [];
        if(i>0 && j>0){
            smallest_cost = edit_table[i-1][j-1] + cost;
            
            smallest = [[i-1,j-1]];

            if (edit_table[i][j-1] + 1 < smallest_cost){
                smallest_cost = edit_table[i][j-1] + 1;
                smallest = [[i,j-1]];
            }
            else if (edit_table[i][j-1] + 1 == smallest_cost){
                smallest.push([i,j-1]);
            }


            if (edit_table[i-1][j]+1 < smallest_cost){
                smallest_cost = edit_table[i-1][j] + 1
                smallest = [[i-1,j]];
            }
            else if (edit_table[i-1][j] + 1 == smallest_cost){
                smallest.push([i-1,j]);
            }
        }

        else if(i==0){
            //one way either up or left
            smallest = [[i,j-1]];
        }
        else{ 
            //one way either up or left
            smallest = [[i-1,j]];
        }
        states.push({backtrace:true,path:path.slice(0),smallest: smallest, i:i,j:j, free:(cost==0)});
        choose_randomly = Math.floor(Math.random()*smallest.length);
        i = smallest[choose_randomly][0];
        j = smallest[choose_randomly][1];
        path.push([i,j]);
    }
    states.push({backtrace:true,path:path.slice(0),smallest: {}, i:i,j:j, free:(true)});
    chapters.push(states.length - 1);


    return {
        "id" : "edit_distance",
        "name": "Edit Distance",
        "text": text,
        "pattern": pattern,
        "table" : edit_table,
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
            var state = this.states[this.current];
            var text_array = [];
            for(i = -1 ; i < this.text.length; i++){
                text_array.push({
                    "letter": (i==-1)?"_":this.text.charAt(i),
                    "index": i+1,
                    "cls": (state.j==i+1)?"cursor":"",
                    "letter_cls": (state.j==i+1) ? (state.free ? "match": "mismatch"): "" ,
                    "index_cls": "",
                });
            }
            render({
                "array": text_array,
                "pad": pad_info(1),
            }, "#monospace-string", area);

            var row_array;
            
            for(i=-1; i < this.pattern.length ; i++){
                row_array = [];

                row_array.push({
                "letter": (i==-1)?"_":this.pattern.charAt(i),
                "index": i+1,
                "cls": (state.i==i+1) ? "cursor":"",
                "letter_cls": (state.i==i+1) ? (state.free ? "match": "mismatch"): "" ,
                "index_cls": "",
                });
                for(j=-1; j < this.text.length; j++){
                    var chosen = "";
                    if(state.backtrace==false){
                        if(state.j==j+1 && state.i==i+1){
                            chosen = "cursor";
                        }
                        else if (compare_vector(state.smallest,[i+1,j+1])){
                            chosen = "match";
                        }
                    }
                    else{
                        
                        if(compare_vector(state.path,[i+1,j+1])){
                            chosen = "found";
                        }
                        else if (compare_vector(state.smallest,[i+1,j+1])){
                            chosen = "match";
                        }
                    }
                    row_array.push({
                    "letter": (state.backtrace || j==-1 || i==-1 || i+1<state.i || (i+1==state.i && j+1<=state.j))?this.table[i+1][j+1]:" ",
                    "index": "",
                    "cls": chosen,
                    "letter_cls": "",
                    "index_cls": "",
                    });
                }
                render({
                    "array": row_array,
                    "pad": pad_info(0),
                },"#monospace-string", area);
            }
        },
    };
}
stralg.story_inits["edit_distance"] = {
    "constructor": create_edit_distance,
    "name": "Edit Distance",
    "long_name": "Edit Distance",
    "type": "approximate",
};
