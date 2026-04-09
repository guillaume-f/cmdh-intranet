import { FormControl, FormGroup } from '@angular/forms';

/**
 * Create a type that represents a form control for each property of an object. It can be used to type a FormGroup easily
 * @example
 * ```ts
 * type Person = {
 *     name: string;
 *     age: number;
 * };
 *
 * type PersonControls = TypedControlsOf<Person>;
 *
 * const personControls: PersonControls = {
 *     name: new FormControl('John'),
 *     age: new FormControl(42),
 * };
 * ```
 */
export type TypedControlsOf<T> = {
    [K in keyof T]: FormControl<T[K] | null>;
};

/**
 * Create a type that represents a nested form control structure for each property of an object.
 * For properties whose keys are specified in the `Groups` generic parameter,
 * a nested FormGroup is created with controls built recursively using NestedTypedControlsOf.
 * For all other keys, a FormControl is created.
 *
 * @remarks
 * This approach avoids accidentally nesting objects that are not intended to be FormGroups.
 *
 * @example
 * ```ts
 * type Address = {
 *   street: string;
 *   city: string;
 * };
 *
 * type Person = {
 *   name: string;
 *   age: number;
 *   address: Address; // we want this to be a nested FormGroup
 * };
 *
 * // Only the 'address' key will be treated as a nested group.
 * type PersonControls = NestedTypedControlsOf<Person, "address">;
 *
 * const personControls: PersonControls = {
 *   name: new FormControl('John'),
 *   age: new FormControl(42),
 *   address: new FormGroup({
 *     street: new FormControl('123 Main St'),
 *     city: new FormControl('New York'),
 *   }),
 * };
 * ```
 */
export type NestedTypedControlsOf<T, Groups extends keyof T = never> = {
    [K in keyof T]: K extends Groups ? FormGroup<TypedControlsOf<T[K]>> : FormControl<T[K] | null>;
};
