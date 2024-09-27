import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
} from "@angular/common";
import {
  DocSPACoreComponent,
  LocationWithSlashes,
} from "@swimlane/docspa-core";

const routes: Routes = [
  {
    // For testing sub-routes
    path: "docspa",
    children: [
      {
        path: "**",
        component: DocSPACoreComponent,
      },
    ],
  },
  {
    path: "**",
    component: DocSPACoreComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: Location, useClass: LocationWithSlashes },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
  ],
})
export class AppRoutingModule {}
