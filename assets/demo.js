var updateLog = function(sn){

    var log =  window.parent.document.getElementById('log') ;
    if(log){
        var state = sn.state(),
            theState = 'State: '+state.state+"\n";
        
        theState += 'Opening: '+state.info.opening+"\n";
        theState += 'Towards: '+state.info.towards+"\n";
        theState += 'HyperExtending: '+state.info.hyperExtending+"\n";
        theState += 'HalfWay: '+state.info.halfway+"\n";
        theState += 'Flickable: '+state.info.flick+"\n";
        theState += 'Translation.absolute: '+state.info.translation.absolute+"\n";
        theState += 'Translation.relative: '+state.info.translation.relative+"\n";
        theState += 'Translation.sinceDirectionChange: '+state.info.translation.sinceDirectionChange+"\n";
        
        log.value=theState;
    }
}