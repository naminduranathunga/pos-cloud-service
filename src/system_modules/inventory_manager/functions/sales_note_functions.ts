import Branch from "../../../schemas/company/branches_schema";
import { format_number } from "./number_formatting";


export default async function get_next_sn_no(branch_id:string|any){
    let branch = branch_id; // can parse branch instance
    if (typeof branch_id === "string") {
        branch = await Branch.findById(branch_id);
    }
    if(branch){
        const metadata = branch.metadata as any;
        let sn_format = metadata.sn_format;
        if (!sn_format) {
            sn_format = "SN-####";
        }
        let sn_no = metadata.sn_next_no;
        if (!sn_no) {
            sn_no = 1;
        }

        // convert to 
        return format_number(sn_format, sn_no);
    }else{
        throw new Error("Branch not found");
    }
}

export async function use_sn_no(branch_id:string|any, grn_no:string){
    let branch = branch_id; // can parse branch instance
    if (typeof branch_id === "string") {
        branch = await Branch.findById(branch_id);
    }
    if(branch){
        const metadata = branch.metadata as any;
        let sn_no = metadata.sn_next_no;
        if (!sn_no) {
            sn_no = 1;
        }
        sn_no++;
        (branch.metadata as any).sn_next_no = sn_no;
        branch.markModified("metadata");
        await branch.save();
    }else{
        throw new Error("Branch not found");
    }
}