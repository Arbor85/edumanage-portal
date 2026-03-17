# Copilot Instructions

These rules apply to all future changes in this catalog repository.
# GitHub Copilot Instructions – .NET API (DDD + TDD + Clean Architecture)

## 🎯 General Guidelines

* Use **latest stable .NET (LTS)** and modern C# features.
* Prefer **minimal APIs or controllers only when appropriate**, while maintaining separation of concerns.
* Write **clean, readable, maintainable code**.
* Follow **SOLID principles**.
* Avoid over-engineering — keep solutions simple and pragmatic.

---

## 🧱 Architecture & Design

### Domain-Driven Design (DDD)

* Organize code into layers:

  * `Domain` – core business logic (entities, value objects, aggregates)
  * `Application` – use cases, commands, queries
  * `Infrastructure` – database, external services
  * `API` – controllers/endpoints

### Rules

* Domain layer must have **no dependencies** on other layers.
* Use **rich domain models**, avoid anemic models.
* Encapsulate logic inside aggregates.

---

## 📁 Folder Structure

```
/src
  /Api
  /Application
    /Features
      /Orders
        CreateOrder
        GetOrder
  /Domain
    /Entities
    /ValueObjects
    /Interfaces
  /Infrastructure
    /Persistence
    /Repositories

/tests
  /UnitTests
  /IntegrationTests
```

---

## 🧩 Patterns & Practices

### MediatR (Mediator Pattern)

* Use **MediatR** for all application logic.
* Each feature should include:

  * `Command` / `Query`
  * `Handler`
* Keep handlers **small, focused, and single-purpose**.

Example:

```csharp
public record CreateOrderCommand(string CustomerName) : IRequest<Guid>;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken ct)
    {
        // business logic
    }
}
```

---

### Repository Pattern

* Define repository interfaces in **Domain or Application layer**.
* Implement repositories in **Infrastructure layer**.
* Do not include business logic in repositories.

```csharp
public interface IOrderRepository
{
    Task AddAsync(Order order);
    Task<Order?> GetByIdAsync(Guid id);
}
```

---

### Entity Framework Core

* Use **latest EF Core version**.
* Place `DbContext` in Infrastructure.
* Use **Fluent API configuration** (avoid data annotations where possible).
* Manage migrations properly.
* Do not expose EF entities outside Infrastructure.

---

## 🧪 Testing (TDD Approach)

### Principles

* Follow **Test-Driven Development (TDD)**:

  1. Write a failing test
  2. Implement minimal code
  3. Refactor

### Requirements

* Maintain **high unit test coverage**.
* Recommended tools:

  * xUnit / NUnit
  * FluentAssertions
  * Moq / NSubstitute

### Guidelines

* Test **behavior, not implementation details**.
* Keep tests simple and readable.

Example:

```csharp
[Fact]
public async Task Should_Create_Order()
{
    // Arrange

    // Act

    // Assert
}
```

---

## 🧾 Records vs Classes

* Prefer **records** for:

  * DTOs
  * Commands / Queries
  * Value Objects

* Use **classes** only when:

  * Mutable state is required
  * Required by EF Core entities

---

## 🧹 Clean Code Rules

* Keep methods:

  * Short
  * Focused on a single responsibility
* Avoid deep nesting.
* Use meaningful, descriptive names.
* Remove unused or dead code.

---

## 🔌 Dependency Injection

* Use built-in .NET DI container.
* Register:

  * MediatR
  * DbContext
  * Repositories
  * Application services

---

## 🚀 API Layer

* Controllers/endpoints should:

  * Be thin
  * Delegate work to MediatR
* Do not include business logic in controllers.

Example:

```csharp
[HttpPost]
public async Task<IActionResult> Create(CreateOrderCommand command)
{
    var id = await _mediator.Send(command);
    return Ok(id);
}
```

---

## ⚡ Performance & Best Practices

* Use `async/await` consistently.
* Avoid blocking calls.
* Pass `CancellationToken` where possible.
* Optimize EF queries (e.g., `AsNoTracking` when appropriate).

---

## 🧭 Copilot Behavior Summary

When generating code, always:

* Follow **DDD and Clean Architecture principles**
* Use **MediatR for application logic**
* Use **EF Core with repository pattern**
* Prefer **records over classes**
* Ensure **code is testable with high coverage**
* Keep structure **clean and consistent**
* Avoid unnecessary complexity

---
