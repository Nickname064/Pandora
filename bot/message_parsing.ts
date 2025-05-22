interface Message{
    contents : MessageContent[],
    reacts : Array<string> //Each string contains only emojis. Used to react to the sent message
}

interface MessageContent{
    type : "code" | "text", //The message type
    contents : string,      //The actual message
    tts? : boolean,          //Do you want to pronounce this message ?

    //Type-specific fields
    code_lang? : string, //Used to specify the language of a code block
}

interface ParsedMessage{
    content : string,
    tts : boolean
}

interface Response{
    messages : ParsedMessage[],
    react? : Array<string>
}


export function parseMessage(source : Message) : Response{

    let result = []

    for(let i = 0; i < source.contents.length; i++){
        
        let message : ParsedMessage = {
            content: "",
            tts: source.contents[i].tts,
        }
        
        switch(source.contents[i].type){
            case "code":
                message.content = "```" + source.contents[i].contents + "```"; 
                break;

            case "text":
                message.content = source.contents[i].contents;
                break;
        }

        result.push(message);
    }

    return {
        messages : result,
        react : source.reacts
    };
}