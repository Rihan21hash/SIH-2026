//#region src/util/properties.ts
function supportsPropertyExpression(spec) {
	return spec["property-type"] === "data-driven" || spec["property-type"] === "cross-faded-data-driven";
}
function supportsZoomExpression(spec) {
	return !!spec.expression && spec.expression.parameters.indexOf("zoom") > -1;
}
function supportsInterpolation(spec) {
	return !!spec.expression && spec.expression.interpolated;
}
//#endregion
export { supportsInterpolation, supportsPropertyExpression, supportsZoomExpression };

//# sourceMappingURL=properties.mjs.map