import Branch from "../../../schemas/company/branches_schema";
import { format_number } from "./number_formatting";


export default async function get_next_grn_no(branch_id:string|any){
    let branch = branch_id; // can parse branch instance
    if (typeof branch_id === "string") {
        branch = await Branch.findById(branch_id);
    }
    if(branch){
        const metadata = branch.metadata as any;
        let grn_format = metadata.grn_format;
        if (!grn_format) {
            grn_format = "GRN-####";
        }
        let grn_no = metadata.grn_no;
        if (!grn_no) {
            grn_no = 1;
        }

        // convert to 
        return format_number(grn_format, grn_no);
    }else{
        throw new Error("Branch not found");
    }
}

export async function use_grn_no(branch_id:string|any, grn_no:string){
    let branch = branch_id; // can parse branch instance
    if (typeof branch_id === "string") {
        branch = await Branch.findById(branch_id);
    }
    if(branch){
        const metadata = branch.metadata as any;
        let grn_no = metadata.grn_no;
        if (!grn_no) {
            grn_no = 1;
        }
        grn_no++;
        (branch.metadata as any).grn_no = grn_no;
        await branch.save();
    }else{
        throw new Error("Branch not found");
    }
}