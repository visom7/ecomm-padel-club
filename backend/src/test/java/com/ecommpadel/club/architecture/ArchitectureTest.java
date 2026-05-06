package com.ecommpadel.club.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(
        packages = "com.ecommpadel.club",
        importOptions = ImportOption.DoNotIncludeTests.class
)
class ArchitectureTest {

    @ArchTest
    static final ArchRule layersShouldBeRespected = layeredArchitecture()
            .consideringOnlyDependenciesInLayers()
            .layer("Controller").definedBy("com.ecommpadel.club.controller..")
            .layer("Service").definedBy("com.ecommpadel.club.service..")
            .layer("Repository").definedBy("com.ecommpadel.club.repository..")
            .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
            .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller")
            .whereLayer("Repository").mayOnlyBeAccessedByLayers("Service");

    @ArchTest
    static final ArchRule packagesShouldBeFreeOfCycles = slices()
            .matching("com.ecommpadel.club.(*)..")
            .should().beFreeOfCycles();

    @ArchTest
    static final ArchRule modelShouldNotDependOnWebLayerOrServices = noClasses()
            .that().resideInAPackage("com.ecommpadel.club.model..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework.stereotype..",
                    "org.springframework.web..",
                    "com.ecommpadel.club.repository..",
                    "com.ecommpadel.club.service.."
            )
            .as("Model classes should not depend on Spring web/stereotype layer, repositories or services");
}
