import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Permission } from "./types";

interface PermissionTableProps {
  permissions: Permission[];
  selectedPermissions: string[];
  mainCheckbox: boolean;
  handleMainCheckboxToggle: () => void;
  handleRowCheckboxToggle: (permissionId: string) => void;
  handleDeletePermission: (permissionId: string) => void;
  handleEditPermission: (permission: Permission) => void;
  handlePermissionToggle: (
    permissionId: string,
    action: "create" | "read" | "update" | "delete",
    checked: boolean,
    urlRestrictValue: string
  ) => void;
}

const PermissionTable: React.FC<PermissionTableProps> = ({
  permissions,
  // selectedPermissions,
  // mainCheckbox,
  // handleMainCheckboxToggle,
  // handleRowCheckboxToggle,
  handleDeletePermission,
  // handleEditPermission,
  handlePermissionToggle,
}) => {
  console.log(
    "Rendering PermissionTable with permissions:",
    JSON.stringify(permissions, null, 2)
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No.</TableHead>
          {/* untuk pengembangan nanti checkbox all delete*/}
          {/* <TableHead className="w-[50px]">
						<Checkbox
							checked={mainCheckbox}
							onCheckedChange={handleMainCheckboxToggle}
						/>
					</TableHead> */}
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Create</TableHead>
          <TableHead>Read</TableHead>
          <TableHead>Update</TableHead>
          <TableHead>Delete</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission) => (
          <TableRow key={permission.id}>
            {/* untuk pengembangan nanti checkbox row delete*/}
            {/* <TableCell className="text-center">
							<Checkbox
								checked={selectedPermissions.includes(permission.id)}
								onCheckedChange={() => handleRowCheckboxToggle(permission.id)}
							/>
						</TableCell> */}
            <TableCell>{permissions.indexOf(permission) + 1}</TableCell>
            <TableCell>{permission.name}</TableCell>
            <TableCell>{permission.description}</TableCell>
            {["create", "read", "update", "delete"].map((action) => (
              <TableCell key={action} className="text-center">
                <Checkbox
                  checked={
                    permission.urlAccess[
                      action as keyof typeof permission.urlAccess
                    ] !== null
                  }
                  onCheckedChange={(checked) => {
                    console.log(`Checkbox changed for ${action}:`, checked);
                    handlePermissionToggle(
                      permission.id,
                      action as "create" | "read" | "update" | "delete",
                      checked === true,
                      permission.urlRestrict[
                        action as keyof typeof permission.urlRestrict
                      ]
                    );
                  }}
                />
                {action}:{" "}
                {permission.urlAccess[
                  action as keyof typeof permission.urlAccess
                ] || "-"}
              </TableCell>
            ))}
            <TableCell>
              {/* <Button
									variant="ghost"
									size="icon"
									onClick={() => {
										console.log("Editing permission:", permission);
										handleEditPermission(permission);
									}}
									className="mr-2"
								>
									<Edit className="h-4 w-4" />
								</Button> */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeletePermission(permission.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PermissionTable;
