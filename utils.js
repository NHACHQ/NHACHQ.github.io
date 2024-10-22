// if more than frames needed, will be ignored.
// E.g, 121 frames, from 0, interval 4, this will stop at 120
// two arrays of different direcions will be returned
function imgSelect(start, end, interval, path){
    var size = 6;
    var s;
    var images = [];
    var images_r = [];
    var c;
    for (var i = 0 ;i< end-start; i++){
        c = i+start;
        if (c>359){c = c%360}
        if (i%interval == 0){
            s = "000000" + c;
            s = s.substr(s.length-size);
            images.push(path+'/'+s+'.jpg');
            images_r.unshift(path+'/'+s+'.jpg');
            // images.push(path+"/"+s+".webp");
            // images_r.unshift(path+"/"+s+".webp");
            //testing
            //document.write(path+"/"+s+".jpg<br>")
        }
    }
    return [images, images_r];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}


//for abrupt trials
// parameters: paths of two iamges
// change point : where the sudden change happens
// num: overall number of frames
// return a set of images with two directions
function abrupt_img(start_path, end_path, change, num){
    var s;
    var images = [];
    var path;
    for (var i = 0 ;i<num; i++){

        if (i < change)
            path = start_path;
        else
            path = end_path;

        images.push(path);
    }
    return images;
}





// this function is for setting up stimuli for random trials
// each time the targe stumuli got shuffled and return three groups of random timeline variables with images 
// paths: the 3D array that stored all the preloaded images
// trials: number of trials where you got the random stlmuli from. By default start from set0

function random_select(tag, paths, trials){
    const dimension = [paths.length, paths[0].length, paths[0][0].length];
    console.log(dimension);
    console.log(paths[paths.length-1]);
    
    var randoms = [[],[],[]];

    var len = paths[0][0].length;
    //this is a timeline variable 2d array
    var temp;
    
    //get a 1D array
    for (var i = 0; i<trials; i++){
        temp = paths[i][0];
        for (var j = 0; j<len; j++){
            randoms[i%3].push({stimulus: temp[j], data: {trial_tag: tag+'random-'+i+'-'+j} });
            //randoms[i%3].push({stimulus: temp[i][j], data: {trial_tag: 'random-'+i+'-'+j} });
        }
    }

    // randomize all images
    for (var j = 0; j < randoms.length; j++){
       randoms[j] = shuffle(randoms[j])
    }

    console.log(randoms[2]);
    return randoms;
}



// timeline vaiable enerator for normal trials
function normal_timeVarGenerator(img_path, tag, paths, boundaries, start, end, interval){

    var c=0;
    var deviation;
    var test_stimuli = [];
    for(var i = start; i<end; i++){
        c = 3*i;
        //caliberation
        if (i%3==0){
            deviation = [-60,30];
        }
        else if (i%3==1){
            deviation = [-45,45];
        }
        else {
            deviation = [-30,60];
        }

        var b2l = imgSelect(deviation[0]+boundaries[i][0], deviation[1]+boundaries[i][0], interval, img_path+i);
        test_stimuli.push({ stimulus: b2l[0], data: {trial_tag: tag+c} });
        test_stimuli.push({ stimulus: b2l[1], data: {trial_tag: tag+c+'r'} });
        c++;
        var l2d = imgSelect(deviation[0]+boundaries[i][1], deviation[1]+boundaries[i][1], interval, img_path+i);
        test_stimuli.push({ stimulus: l2d[0], data: {trial_tag: tag+c} });
        test_stimuli.push({ stimulus: l2d[1], data: {trial_tag: tag+c+'r'} });
        c++;
        var d2b = imgSelect(deviation[0]+boundaries[i][2], deviation[1]+boundaries[i][2], interval, img_path+i);
        test_stimuli.push({ stimulus: d2b[0], data: {trial_tag: tag+c} });
        test_stimuli.push({ stimulus: d2b[1], data: {trial_tag: tag+c+'r'} });
        paths.push(b2l,l2d,d2b);

    }


    return test_stimuli;
}

function abrupt_timeVarGenerator(paths, ab_path, trials, type){
    var abrupt_stimuli = [];
    var temp;
    var end;
    for (var i = 0; i<trials; i++){
        end=2*i+1;
        temp = abrupt_img(ab_path+2*i+type,ab_path+end+type, 10+2*i, 30 );
        paths.push(ab_path+2*i+type,ab_path+end+type);
        abrupt_stimuli.push({ stimulus: temp, data: {trial_tag: 'a'+i} });

        temp = abrupt_img(ab_path+end+type,ab_path+2*i+type, 10+2*i, 30 );
        abrupt_stimuli.push({ stimulus: temp, data: {trial_tag: 'ar'+i} });
    }


    return abrupt_stimuli;
}

// timeline vaiable generator for pre-exposure trials
function exposure_timeVarGenerator(img_path, tag, paths, boundaries, start, end,interval){

    var c=0;
    var deviation;
    var test_stimuli = [];
    for(var i = start; i<end; i++){
        c = 3*i;
        //caliberation
        if (i%3==0){
            deviation = [-60,30];
        }
        else if (i%3==1){
            deviation = [-45,45];
        }
        else {
            deviation = [-30,60];
        }

        var b2l = imgSelect(deviation[0]+boundaries[i][0], deviation[1]+boundaries[i][0], interval, img_path+i);
        test_stimuli.push({ stimulus: b2l[0], data: {trial_tag: tag + c},
            exposure: "<figure><img src= "+ b2l[0][0] +"><figcaption style='color:#ffffff'>Start: Bedroom</figcaption></figure>  <figure><img src="+b2l[0][b2l[0].length-1] +"><figcaption style='color:#ffffff'>End: Living room</figcaption></figure>"});
        test_stimuli.push({ stimulus: b2l[1], data: {trial_tag: tag +c+'r'},           
            exposure: "<figure><img src= "+ b2l[1][0] +"><figcaption style='color:#ffffff'>Start: Living room</figcaption></figure>  <figure><img src="+b2l[1][b2l[1].length-1] +"><figcaption style='color:#ffffff'>End: Bedroom</figcaption></figure>"});
        c++;
        var l2d = imgSelect(deviation[0]+boundaries[i][1], deviation[1]+boundaries[i][1], interval, img_path+i);
        test_stimuli.push({ stimulus: l2d[0], data: {trial_tag: tag +c} ,
            exposure: "<figure><img src= "+ l2d[0][0] +"><figcaption style='color:#ffffff'>Start: Living room</figcaption></figure>  <figure><img src="+l2d[0][l2d[0].length-1] +"><figcaption style='color:#ffffff'>End: Dining room</figcaption></figure>"});
        test_stimuli.push({ stimulus: l2d[1], data: {trial_tag: tag +c+'r'},
            exposure: "<figure><img src= "+ l2d[1][0] +"><figcaption style='color:#ffffff'>Start: Dining room</figcaption></figure>  <figure><img src="+l2d[1][b2l[1].length-1] +"><figcaption style='color:#ffffff'>End: Living room</figcaption></figure>"});
       
        c++;
        var d2b = imgSelect(deviation[0]+boundaries[i][2], deviation[1]+boundaries[i][2], interval,  img_path+i);
        test_stimuli.push({ stimulus: d2b[0], data: {trial_tag: tag +c},
            exposure: "<figure><img src= "+ d2b[0][0] +"><figcaption style='color:#ffffff'>Start: Dining room</figcaption></figure>  <figure><img src="+d2b[0][l2d[0].length-1] +"><figcaption style='color:#ffffff'>End: Bedroom</figcaption></figure>"});
        test_stimuli.push({ stimulus: d2b[1], data: {trial_tag: tag +c+'r'},
            exposure: "<figure><img src= "+ d2b[1][0] +"><figcaption style='color:#ffffff'>Start: Bedroom</figcaption></figure>  <figure><img src="+d2b[1][b2l[1].length-1] +"><figcaption style='color:#ffffff'>End: Dining room</figcaption></figure>"});
       
    
        paths.push(b2l,l2d,d2b);
        //paths.push(b2l);

    }


    return test_stimuli;
}

function variation_timeVarGenerator(img_path, tag, intervals, num_sets_each, paths, boundaries, start, end){
    var test_stimuli = [];
    if (intervals.length*num_sets_each != end-start){
        throw "number of variation case and stimuli set does not match!";
    }

    for (var i = 0; i < intervals.length; i++){
        test_stimuli = test_stimuli.concat(normal_timeVarGenerator(img_path, tag, paths, boundaries, i*num_sets_each+start, (i+1)*num_sets_each+start, intervals[i]));
    }
    //console.log(test_stimuli[0])
    return test_stimuli;
}


// timeline vaiable generator for pre-exposure trials
function exposure_image_only_timeVarGenerator(img_path, tag, paths, boundaries, start, end,interval){

    var c=0;
    var deviation;
    var test_stimuli = [];
    for(var i = start; i<end; i++){
        c = 3*i;
        //caliberation
        if (i%3==0){
            deviation = [-60,30];
        }
        else if (i%3==1){
            deviation = [-45,45];
        }
        else {
            deviation = [-30,60];
        }

        var b2l = imgSelect(deviation[0]+boundaries[i][0], deviation[1]+boundaries[i][0], interval, img_path+i);
        test_stimuli.push({ stimulus: b2l[0], data: {trial_tag: tag + c},
            exposure: "<figure><img src= "+ b2l[0][0] +"></figure>  <figure><img src="+b2l[0][b2l[0].length-1] +"></figure>"});
        test_stimuli.push({ stimulus: b2l[1], data: {trial_tag: tag +c+'r'},           
            exposure: "<figure><img src= "+ b2l[1][0] +"></figure>  <figure><img src="+b2l[1][b2l[1].length-1] +"></figure>"});
        c++;
        var l2d = imgSelect(deviation[0]+boundaries[i][1], deviation[1]+boundaries[i][1], interval, img_path+i);
        test_stimuli.push({ stimulus: l2d[0], data: {trial_tag: tag +c} ,
            exposure: "<figure><img src= "+ l2d[0][0] +"></figure>  <figure><img src="+l2d[0][l2d[0].length-1] +"></figure>"});
        test_stimuli.push({ stimulus: l2d[1], data: {trial_tag: tag +c+'r'},
            exposure: "<figure><img src= "+ l2d[1][0] +"></figure>  <figure><img src="+l2d[1][b2l[1].length-1] +"></figure>"});
       
        c++;
        var d2b = imgSelect(deviation[0]+boundaries[i][2], deviation[1]+boundaries[i][2], interval,  img_path+i);
        test_stimuli.push({ stimulus: d2b[0], data: {trial_tag: tag +c},
            exposure: "<figure><img src= "+ d2b[0][0] +"></figure>  <figure><img src="+d2b[0][l2d[0].length-1] +"></figure>"});
        test_stimuli.push({ stimulus: d2b[1], data: {trial_tag: tag +c+'r'},
            exposure: "<figure><img src= "+ d2b[1][0] +"></figure>  <figure><img src="+d2b[1][b2l[1].length-1] +"></figure>"});
       
    
        paths.push(b2l,l2d,d2b);
        //paths.push(b2l);

    }


    return test_stimuli;
}


// timeline vaiable generator for pre-exposure trials
function exposure_word_only_timeVarGenerator(img_path, tag, paths, boundaries, start, end,interval){

    var c=0;
    var deviation;
    var test_stimuli = [];
    for(var i = start; i<end; i++){
        c = 3*i;
        //caliberation
        if (i%3==0){
            deviation = [-60,30];
        }
        else if (i%3==1){
            deviation = [-45,45];
        }
        else {
            deviation = [-30,60];
        }

        var b2l = imgSelect(deviation[0]+boundaries[i][0], deviation[1]+boundaries[i][0], interval, img_path+i);
        test_stimuli.push({ stimulus: b2l[0], data: {trial_tag: tag + c},
            exposure: "<p style='color:#ffffff'>Start: Bedroom <br> End: Living room</p>"});
        test_stimuli.push({ stimulus: b2l[1], data: {trial_tag: tag +c+'r'},           
            exposure: "<p style='color:#ffffff'>Start: Living room <br> End: Bedroom</p>"});
        c++;
        var l2d = imgSelect(deviation[0]+boundaries[i][1], deviation[1]+boundaries[i][1], interval, img_path+i);
        test_stimuli.push({ stimulus: l2d[0], data: {trial_tag: tag +c} ,
            exposure: "<p style='color:#ffffff'>Start: Living room <br> End: Dining room</p>"});
        test_stimuli.push({ stimulus: l2d[1], data: {trial_tag: tag +c+'r'},
            exposure: "<p style='color:#ffffff'>Start: Dining room <br> End: Living room</p>"});
       
        c++;
        var d2b = imgSelect(deviation[0]+boundaries[i][2], deviation[1]+boundaries[i][2], interval,  img_path+i);
        test_stimuli.push({ stimulus: d2b[0], data: {trial_tag: tag +c},
            exposure: "<p style='color:#ffffff'>Start: Dining room  <br> End: Bedroom</p>"});
        test_stimuli.push({ stimulus: d2b[1], data: {trial_tag: tag +c+'r'},
            exposure: "<p style='color:#ffffff'>Start: Bedroom <br> End: Dining room</p>"});
       
    
        paths.push(b2l,l2d,d2b);
        //paths.push(b2l);

    }


    return test_stimuli;
}

// timeline vaiable generator for pre-exposure trials
function null_exposure_timeVarGenerator(img_path, tag, paths, boundaries, start, end,interval){

    var c=0;
    var deviation;
    var test_stimuli = [];
    for(var i = start; i<end; i++){
        c = 3*i;
        //caliberation
        if (i%3==0){
            deviation = [-60,30];
        }
        else if (i%3==1){
            deviation = [-45,45];
        }
        else {
            deviation = [-30,60];
        }

        var b2l = imgSelect(deviation[0]+boundaries[i][0], deviation[1]+boundaries[i][0], interval, img_path+i);
        test_stimuli.push({ stimulus: b2l[0], data: {trial_tag: tag + c},
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
        test_stimuli.push({ stimulus: b2l[1], data: {trial_tag: tag +c+'r'},           
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
        c++;
        var l2d = imgSelect(deviation[0]+boundaries[i][1], deviation[1]+boundaries[i][1], interval, img_path+i);
        test_stimuli.push({ stimulus: l2d[0], data: {trial_tag: tag +c} ,
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
        test_stimuli.push({ stimulus: l2d[1], data: {trial_tag: tag +c+'r'},
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
       
        c++;
        var d2b = imgSelect(deviation[0]+boundaries[i][2], deviation[1]+boundaries[i][2], interval,  img_path+i);
        test_stimuli.push({ stimulus: d2b[0], data: {trial_tag: tag +c},
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
        test_stimuli.push({ stimulus: d2b[1], data: {trial_tag: tag +c+'r'},
            exposure: '<div style="font-size:60px;">+</div>'+
            '<p style="color:#a6a6a6"> empty </p>',});
       
    
        paths.push(b2l,l2d,d2b);
        //paths.push(b2l);

    }


    return test_stimuli;
}