import { toast } from "react-toastify";


export default function ToastMessage(message: string,type: string, CID : String) {
    if (type === "error") {
        console.error(message);
        toast .error(message, {
            position: "bottom-right"
        });
    } else if (type === "success") {
        console.log(message);
        toast.success(message, {
            position: "bottom-right"
        });
    }else if(type === "successs"){
        console.log("=====>",message);

        toast.info(message, {
            data: {
              title: "Success Upload",
              text: `Your files are uploaded successfully ${CID}`,
            },
          });
    } else {
        console.log(message);
        toast.warning(message, {
            position: "bottom-right"
        });
    }
    

}