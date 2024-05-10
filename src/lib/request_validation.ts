
export interface ValidationRule {
    type:string, required:boolean, default?:any
};

export default function ValidateRequest(obj:any, rules:Array<ValidationRule>){
    var validatedObject = {};
    var error = false;

    try {
        rules.forEach((rule:ValidationRule)=>{
            
        });    
    } catch (error) {
        
    }
}